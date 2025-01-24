import React, { useState } from "react";
import "./App.css"; 

function App() {
  const [image, setImage] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [imgUrl, setImgUrl] = useState(null);

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handlePredict = async () => {
    if (!image) {
      alert("Veuillez d'abord sélectionner une image !");
      return;
    }

    const formData = new FormData();
    formData.append("file", image);

    const response = await fetch("http://localhost:8000/predict/", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setPredictions(data.predictions);
    setImgUrl(`data:image/jpeg;base64,${data.image}`);
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Fractura</h1>
        <p className="subtitle">
          Bienvenue dans votre monde virtuel ! Plus besoin d'un radiologiste !
        </p>
      </header>

      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file-input"
        />
        <button onClick={handlePredict} className="predict-button">
          Analyser l'image
        </button>
      </div>

      {imgUrl && (
        <div className="results-section">
          <div className="image-container">
            <img src={imgUrl} alt="Prédiction" className="annotated-image" />
          </div>

          <section className="predictions-container">
            <h2 className="predictions-title">Résultats de la prédiction</h2>
            {predictions.length === 0 ? (
              <p className="no-predictions">Aucune prédiction pour le moment.</p>
            ) : (
              <ul className="predictions-list">
                {predictions.map((prediction, index) => (
                  <li key={index} className="prediction-item">
                    <p className="prediction-label">
                      <span className="highlight">Label :</span> {prediction.label}
                    </p>
                    <p>
                      <span className="highlight">Confiance :</span> {prediction.confidence}%
                    </p>
                    <p>
                      <span className="highlight">BBox :</span> {prediction.bbox.join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;