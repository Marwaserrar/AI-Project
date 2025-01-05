import React, { useState } from "react";

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

    const response = await fetch("http://127.0.0.1:8000/predict/", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setPredictions(data.predictions);
    setImgUrl(`data:image/jpeg;base64,${data.image}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r  flex flex-col items-center py-10 px-4">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-bold text-blue-600 mb-4 animate-fade-in">
          Détection des fractures
        </h1>
        <p className="text-lg text-gray-800">
          Bienvenue dans votre monde virtuel ! Plus besoin d'un radiologiste !
        </p>
      </header>

      <div className="flex flex-col items-center space-y-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file-input file-input-bordered file-input-info w-full max-w-xs"
        />
        <button
          onClick={handlePredict}
          className="btn btn-primary btn-wide hover:scale-105 transition-transform duration-200"
        >
          Analyser l'image
        </button>
      </div>

      {/* Section des résultats et de l'image */}
      {imgUrl && (
        <div className="mt-10 flex flex-col md:flex-row items-start gap-8 w-full max-w-5xl">
          {/* Image annotée */}
          <div className="flex-1">
            <img
              src={imgUrl}
              alt="Prédiction"
              className="rounded-lg shadow-lg border-2 border-blue-500 hover:shadow-xl transition-shadow duration-300"
            />
          </div>

          {/* Résultats des prédictions */}
          <section className="flex-1 bg-white shadow-lg rounded-lg p-6 border-t-4 border-blue-500">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Résultats de la prédiction
            </h2>
            {predictions.length === 0 ? (
              <p className="text-gray-600">Aucune prédiction pour le moment.</p>
            ) : (
              <ul className="space-y-4">
                {predictions.map((prediction, index) => (
                  <li
                    key={index}
                    className="p-4 border rounded-lg bg-yellow-50 shadow hover:bg-yellow-100 transition"
                  >
                    <p className="font-medium">
                      <span className="text-blue-600">Label :</span>{" "}
                      {prediction.label}
                    </p>
                    <p>
                      <span className="text-blue-600">Confiance :</span>{" "}
                      {prediction.confidence}%
                    </p>
                    <p>
                      <span className="text-blue-600">BBox :</span>{" "}
                      {prediction.bbox.join(", ")}
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
