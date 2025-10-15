from flask import Flask, jsonify, render_template

# Initialize the Flask application
app = Flask(__name__)

# This is the same data from your React component.
# In a real application, you would load this from a database or a file.
FRA_STATE_DATA = [
    { "state": "Andhra Pradesh", "individual_claims": 285098, "community_claims": 3294, "total_claims": 288392, "individual_titles": 226651, "community_titles": 1822, "total_titles": 228473, "individual_land": 454706, "community_land": 526454, "total_land": 981160.00, "claims_disposed_percent": 99.48, "lat": 15.9129, "lon": 79.7400 },
    { "state": "Assam", "individual_claims": 148965, "community_claims": 6046, "total_claims": 155011, "individual_titles": 57325, "community_titles": 1477, "total_titles": 58802, "individual_land": None, "community_land": None, "total_land": None, "claims_disposed_percent": 37.93, "lat": 26.2006, "lon": 92.9376 },
    { "state": "Bihar", "individual_claims": 4696, "community_claims": 0, "total_claims": 4696, "individual_titles": 191, "community_titles": 0, "total_titles": 191, "individual_land": 53.03, "community_land": 0.00, "total_land": 53, "claims_disposed_percent": 99.81, "lat": 25.0961, "lon": 85.3131 },
    { "state": "Chhattisgarh", "individual_claims": 890220, "community_claims": 57259, "total_claims": 947479, "individual_titles": 481432, "community_titles": 52636, "total_titles": 534068, "individual_land": 949770.89, "community_land": 9102957.49, "total_land": 10052728.38, "claims_disposed_percent": 99.30, "lat": 21.2787, "lon": 81.8661 },
    { "state": "Goa", "individual_claims": 9757, "community_claims": 379, "total_claims": 10136, "individual_titles": 856, "community_titles": 15, "total_titles": 871, "individual_land": 1506.45, "community_land": 18.66, "total_land": 1525.11, "claims_disposed_percent": 17.98, "lat": 15.2993, "lon": 74.1240 },
    { "state": "Gujarat", "individual_claims": 183055, "community_claims": 7187, "total_claims": 190242, "individual_titles": 98732, "community_titles": 4792, "total_titles": 103524, "individual_land": 168448.83, "community_land": 1240680.15, "total_land": 1409128.99, "claims_disposed_percent": 55.64, "lat": 22.2587, "lon": 71.1924 },
    { "state": "Himachal Pradesh", "individual_claims": 4981, "community_claims": 683, "total_claims": 5664, "individual_titles": 755, "community_titles": 146, "total_titles": 901, "individual_land": 138.84, "community_land": 62677.24, "total_land": 62816.08, "claims_disposed_percent": 16.86, "lat": 31.1048, "lon": 77.1734 },
    { "state": "Jharkhand", "individual_claims": 107032, "community_claims": 3724, "total_claims": 110756, "individual_titles": 59866, "community_titles": 2104, "total_titles": 61970, "individual_land": 153395.86, "community_land": 103758.97, "total_land": 257154.83, "claims_disposed_percent": 81.33, "lat": 23.6102, "lon": 85.2799 },
    { "state": "Karnataka", "individual_claims": 289236, "community_claims": 5940, "total_claims": 295176, "individual_titles": 15355, "community_titles": 1345, "total_titles": 16700, "individual_land": 20296.12, "community_land": 43478.00, "total_land": 63774.12, "claims_disposed_percent": 94.55, "lat": 15.3173, "lon": 75.7139 },
    { "state": "Kerala", "individual_claims": 44455, "community_claims": 1014, "total_claims": 45469, "individual_titles": 29422, "community_titles": 282, "total_titles": 29704, "individual_land": 38810.58, "community_land": 827461.83, "total_land": 1463614.46, "claims_disposed_percent": 93.56, "lat": 10.8505, "lon": 76.2711 },
    
    { "state": "Madhya Pradesh", "individual_claims": 585326, "community_claims": 42187, "total_claims": 627513, "individual_titles": 266901, "community_titles": 27976, "total_titles": 294877, "individual_land": 788651.25, "community_land": 1463614.46, "total_land": 2367147.52, "claims_disposed_percent": 98.37, "lat": 22.9734, "lon": 78.6569 },
    { "state": "Maharashtra", "individual_claims": 397897, "community_claims": 11259, "total_claims": 409156, "individual_titles": 199667, "community_titles": 8668, "total_titles": 208335, "individual_land": 461491.25, "community_land": 3371497.43, "total_land": 3832988.68, "claims_disposed_percent": 93.11, "lat": 19.7515, "lon": 75.7139 },
    { "state": "Odisha", "individual_claims": 732530, "community_claims": 35843, "total_claims": 768373, "individual_titles": 463129, "community_titles": 8990, "total_titles": 472119, "individual_land": 676078.86, "community_land": 763729.00, "total_land": 1439807.86, "claims_disposed_percent": 80.49, "lat": 20.9517, "lon": 85.0985 },
    { "state": "Rajasthan", "individual_claims": 113162, "community_claims": 5213, "total_claims": 118375, "individual_titles": 49215, "community_titles": 2551, "total_titles": 51766, "individual_land": 70387.18, "community_land": 239763.95, "total_land": 310151.13, "claims_disposed_percent": 99.42, "lat": 27.0238, "lon": 74.2179 },
    { "state": "Tamil Nadu", "individual_claims": 33119, "community_claims": 1548, "total_claims": 34667, "individual_titles": 15442, "community_titles": 1066, "total_titles": 16508, "individual_land": 22104.80, "community_land": 60468.77, "total_land": 82573.57, "claims_disposed_percent": 84.28, "lat": 11.1271, "lon": 78.6569 },
    { "state": "Telangana", "individual_claims": 651822, "community_claims": 3427, "total_claims": 655249, "individual_titles": 230735, "community_titles": 721, "total_titles": 231456, "individual_land": 669689.14, "community_land": 457663.17, "total_land": 1127352.32, "claims_disposed_percent": 49.73, "lat": 18.1124, "lon": 79.0193 },
    { "state": "Tripura", "individual_claims": 200557, "community_claims": 164, "total_claims": 200721, "individual_titles": 127931, "community_titles": 101, "total_titles": 128032, "individual_land": 465192.88, "community_land": 552.40, "total_land": 465745.28, "claims_disposed_percent": 98.09, "lat": 23.9408, "lon": 91.9882 },
    { "state": "Uttar Pradesh", "individual_claims": 92972, "community_claims": 1194, "total_claims": 94166, "individual_titles": 22537, "community_titles": 893, "total_titles": 23430, "individual_land": None, "community_land": None, "total_land": None, "claims_disposed_percent": 100.00, "lat": 26.8467, "lon": 80.9462 },
    { "state": "Uttarakhand", "individual_claims": 3587, "community_claims": 3091, "total_claims": 6678, "individual_titles": 184, "community_titles": 1, "total_titles": 185, "individual_land": 0.00, "community_land": 0.00, "total_land": 0.00, "claims_disposed_percent": 100.00, "lat": 30.0668, "lon": 79.0193 },
    { "state": "West Bengal", "individual_claims": 131962, "community_claims": 10119, "total_claims": 142081, "individual_titles": 44444, "community_titles": 686, "total_titles": 45130, "individual_land": 21014.27, "community_land": 572.03, "total_land": 21586.29, "claims_disposed_percent": 99.74, "lat": 22.9868, "lon": 87.8550 },
    { "state": "Jammu & Kashmir", "individual_claims": 33233, "community_claims": 12857, "total_claims": 46090, "individual_titles": 429, "community_titles": 5591, "total_titles": 6020, "individual_land": None, "community_land": None, "total_land": None, "claims_disposed_percent": 99.68, "lat": 33.7782, "lon": 76.5762 }
]


@app.route("/")
def index():
    """Renders the main map page from the template."""
    return render_template("index.html")


@app.route("/api/states")
def get_states_data():
    """Provides the state-level FRA data as a JSON response."""
    return jsonify(FRA_STATE_DATA)


if __name__ == "__main__":
    # Runs the app in debug mode.
    # In a production environment, you would use a proper WSGI server like Gunicorn.
    app.run(debug=True)