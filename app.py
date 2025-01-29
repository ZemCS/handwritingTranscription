from flask import Flask, jsonify, request

app = Flask(__name__)


@app.route("/")
def function():
    print("This is our function")


if __name__ == "__main__":
    app.run(debug=True)
