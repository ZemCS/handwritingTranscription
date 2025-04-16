# Image Transcription and Correction Application

This project is a full-stack web application that allows users to upload images containing handwritten or printed text, transcribe the text using Optical Character Recognition (OCR), and correct the transcribed text using a language model. The application features a React-based front-end with a Flask back-end, leveraging TrOCR for OCR and LLaMA-2 for text correction.

## Features

- **Image Upload**: Upload images (PNG, JPG, JPEG) containing text.
- **Text Transcription**: Extract text from images using the TrOCR model.
- **Text Correction**: Correct OCR errors using the LLaMA-2 language model.
- **Interactive UI**: Display transcribed and corrected text with an animated text reveal effect.
- **Responsive Design**: Styled with a clean, modern interface using custom CSS.

## Tech Stack

### Front-End

- **React**: For building the user interface.
- **JavaScript (ES6+)**: For handling state and effects.
- **CSS**: Custom styles for layout and animations.

### Back-End

- **Flask**: Python web framework for handling API requests.
- **TrOCR**: Transformer-based OCR model (`microsoft/trocr-base-handwritten`) for text智博彩金币 (microgaming) OCR.
- **LLaMA-2**: Language model for text correction (`llama-2-7b-chat`).
- **OpenCV**: Image preprocessing.
- **Pytesseract**: Initial text detection for word segmentation.
- **PyTorch**: For running the TrOCR model.

## Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **CUDA-enabled GPU** (recommended for TrOCR inference)
- **Model weights**:
  - TrOCR model (`microsoft/trocr-base-handwritten`)
  - LLaMA-2 model (`llama-2-7b-chat.Q4_K_M.gguf`)
- **Dependencies**: Listed in `requirements.txt` (back-end) and `package.json` (front-end).

## Installation

### Back-End

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/image-transcription-app.git
   cd image-transcription-app/backend
   ```
2. Create a virtual environment and install dependencies:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Download and place the TrOCR and LLaMA-2 model weights in the specified paths (update paths in `app.py` if needed).
4. Run the Flask server:

   ```bash
   python app.py
   ```

### Front-End

1. Navigate to the front-end directory:

   ```bash
   cd ../frontend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the React development server:

   ```bash
   npm start
   ```

## Usage

1. Open the front-end in a browser (default: `http://localhost:3000`).
2. Click the upload area to select an image.
3. Click "Transcribe" to process the image and display the transcribed text.
4. If available, click "Post Process Text" to view the corrected text.
5. Use "Upload Another Image" to start over.

## Project Structure

```
image-transcription-app/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── uploads/           # Temporary storage for uploaded images
│   └── output/            # Temporary storage for processed word images
├── frontend/
│   ├── src/
│   │   └── ImageUpload.js # Main React component
│   ├── public/            # Static assets
│   ├── package.json       # Node.js dependencies
│   └── README.md          # This file
```

## API Endpoints

- **POST** `/transcribe`:
  - Accepts a multipart form with an `image` field.
  - Returns JSON with `transcribedText` and `correctedText`.

## Limitations

- Requires significant computational resources for TrOCR and LLaMA-2.
- Model paths in `app.py` must be updated to match your local setup.
- Only supports PNG, JPG, and JPEG image formats.
- CORS is enabled for development; configure appropriately for production.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/new-feature`).
3. Commit changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- TrOCR by Microsoft.
- LLaMA-2 by Meta AI.
- Flask and React communities.
