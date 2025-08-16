from flask import Flask, render_template

# Initialize the Flask application
app = Flask(__name__)

@app.route('/')
def index():
    """
    Renders the main page of the markdown editor.
    """
    return render_template('index.html')

if __name__ == '__main__':
    # Runs the Flask app
    app.run(debug=True)
