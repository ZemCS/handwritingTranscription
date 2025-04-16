import os

import cv2
import numpy as np
import pytesseract
import torch
from flask import Flask, jsonify, request
from flask_cors import CORS
from llama_cpp import Llama
from pytesseract import Output
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = "./uploads"
OUTPUT_FOLDER = "./output"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Load TrOCR model
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-handwritten")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-handwritten")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model_path = "C:\\Semester Work\\AI\\Project\\final_model.pth"  # Update path as needed
model.load_state_dict(torch.load(model_path, map_location=device))
model.to(device)
model.eval()

# Load LLaMA-2 model
llama_model_path = (
    "C:\\Semester Work\\NLP\\llama-2-7b-chat.Q4_K_M.gguf"  # Update path as needed
)
llm = Llama(model_path=llama_model_path, n_ctx=512, n_threads=4)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def separate_words(image_path, output_path):
    orig_img = cv2.imread(image_path)
    if orig_img is None:
        raise ValueError("Image not found or unable to read.")

    gray = cv2.cvtColor(orig_img, cv2.COLOR_BGR2GRAY)
    gray = cv2.fastNlMeansDenoising(gray)
    gray = cv2.convertScaleAbs(gray, alpha=1.5, beta=0)
    binary = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2
    )
    kernel = np.ones((2, 2), np.uint8)
    binary = cv2.dilate(binary, kernel, iterations=1)

    custom_config = r"--oem 3 --psm 6"
    data = pytesseract.image_to_data(
        binary, output_type=Output.DICT, config=custom_config
    )

    ext = os.path.splitext(image_path)[1]
    image_name = os.path.splitext(os.path.basename(image_path))[0]
    output_dir = os.path.join(output_path, f"{image_name}_words")
    os.makedirs(output_dir, exist_ok=True)

    file_paths = []
    index = 1

    n_boxes = len(data["text"])
    for i in range(n_boxes):
        text = data["text"][i].strip()
        if text and any(c.isalnum() for c in text):
            x = data["left"][i]
            y = data["top"][i]
            w = data["width"][i]
            h = data["height"][i]
            padding = 5
            x = max(0, x - padding)
            y = max(0, y - padding)
            w = min(orig_img.shape[1] - x, w + 2 * padding)
            h = min(orig_img.shape[0] - y, h + 2 * padding)
            cropped = orig_img[y : y + h, x : x + w]
            if cropped.size == 0:
                continue
            filename = os.path.join(output_dir, f"{index}{ext}")
            cv2.imwrite(filename, cropped)
            abs_path = os.path.abspath(filename)
            file_paths.append(abs_path)
            index += 1

    return file_paths


def resize_and_pad(img, target_size=384):
    h, w = img.shape[:2]
    if h > w:
        new_h = target_size
        new_w = int(w * (target_size / h))
    else:
        new_w = target_size
        new_h = int(h * (target_size / w))
    resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
    new_img = np.zeros((target_size, target_size, 3), dtype=np.uint8)
    pad_h = (target_size - new_h) // 2
    pad_w = (target_size - new_w) // 2
    new_img[pad_h : pad_h + new_h, pad_w : pad_w + new_w, :] = resized
    return new_img


def correct_ocr_text(ocr_text):
    prompt = f"""
    You are an expert in text correction. Below is an OCR-generated text with potential errors in spelling, grammar, and word choice. Your task is to correct the text to make it grammatically correct, coherent, and natural, preserving the original meaning. Return only the corrected text. Make sure the final text makes sense and if you add words then do not add more than 1 (one) word.

    OCR Text: {ocr_text}

    Corrected Text:
    """
    response = llm(prompt, max_tokens=512, temperature=0.25, top_p=0.9, stop=["\n\n"])
    corrected_text = response["choices"][0]["text"].strip()
    return corrected_text


@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        image_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(image_path)

        try:
            # Step 1: Separate words
            word_paths = separate_words(image_path, OUTPUT_FOLDER)

            # Step 2: Perform OCR on each word
            predicted_text = ""
            for word_path in word_paths:
                image = cv2.imread(word_path)
                if image is None:
                    continue
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                preprocessed_image = resize_and_pad(image_rgb)
                pixel_values = processor(
                    preprocessed_image, return_tensors="pt"
                ).pixel_values.to(device)
                with torch.no_grad():
                    generated_ids = model.generate(
                        pixel_values, max_length=64, num_beams=4, early_stopping=True
                    )
                word_text = processor.batch_decode(
                    generated_ids, skip_special_tokens=True
                )[0]
                predicted_text += word_text + " "
            predicted_text = predicted_text.strip()

            # Step 3: Correct the OCR text
            corrected_text = correct_ocr_text(predicted_text) if predicted_text else ""

            return jsonify(
                {"transcribedText": predicted_text, "correctedText": corrected_text}
            )

        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            # Clean up
            if os.path.exists(image_path):
                os.remove(image_path)
            # Optionally clean up word images
            image_name = os.path.splitext(filename)[0]
            output_dir = os.path.join(OUTPUT_FOLDER, f"{image_name}_words")
            if os.path.exists(output_dir):
                for f in os.listdir(output_dir):
                    os.remove(os.path.join(output_dir, f))
                os.rmdir(output_dir)

    return jsonify({"error": "Invalid file type"}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)
