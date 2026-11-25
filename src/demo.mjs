export const DEMO = {
  "schemaVersion": 1,
  "title": "Synthetic English–Hindi subtitle evaluation",
  "currency": "USD",
  "source": [
    {
      "id": "1",
      "startMs": 0,
      "endMs": 4000,
      "text": "Water changes into vapour when heated."
    },
    {
      "id": "2",
      "startMs": 4500,
      "endMs": 8500,
      "text": "Observe the droplets on the cool surface."
    },
    {
      "id": "3",
      "startMs": 9000,
      "endMs": 12000,
      "text": "Record what you notice."
    },
    {
      "id": "4",
      "startMs": 12500,
      "endMs": 16500,
      "text": "Explain the result in your own words."
    },
    {
      "id": "5",
      "startMs": 17000,
      "endMs": 21000,
      "text": "Compare your findings with a partner."
    }
  ],
  "models": [
    {
      "id": "a",
      "label": "Candidate A",
      "version": "synthetic-v1",
      "outputs": [
        {
          "id": "1",
          "startMs": 0,
          "endMs": 4000,
          "text": "गर्म करने पर पानी भाप बन जाता है।",
          "ratings": {
            "meaning": 5,
            "grammar": 5,
            "register": 4,
            "pedagogy": 4
          },
          "critical": false
        },
        {
          "id": "2",
          "startMs": 4500,
          "endMs": 8500,
          "text": "ठंडी सतह पर पानी की बूँदें देखें।",
          "ratings": {
            "meaning": 5,
            "grammar": 5,
            "register": 5,
            "pedagogy": 4
          },
          "critical": false
        },
        {
          "id": "3",
          "startMs": 9000,
          "endMs": 12000,
          "text": "जो देखें, उसे लिखें।",
          "ratings": {
            "meaning": 5,
            "grammar": 5,
            "register": 4,
            "pedagogy": 4
          },
          "critical": false
        },
        {
          "id": "4",
          "startMs": 12500,
          "endMs": 16500,
          "text": "परिणाम अपने शब्दों में समझाएँ।",
          "ratings": {
            "meaning": 5,
            "grammar": 5,
            "register": 5,
            "pedagogy": 4
          },
          "critical": false
        },
        {
          "id": "5",
          "startMs": 17000,
          "endMs": 21000,
          "text": "साथी के निष्कर्षों से तुलना करें।",
          "ratings": {
            "meaning": 4,
            "grammar": 5,
            "register": 5,
            "pedagogy": 4
          },
          "critical": false
        }
      ],
      "economics": {
        "inputTokens": 1200,
        "outputTokens": 1400,
        "inputPerMillion": 1,
        "outputPerMillion": 3,
        "reviewMinutes": 4
      }
    },
    {
      "id": "b",
      "label": "Candidate B",
      "version": "synthetic-v1",
      "outputs": [
        {
          "id": "1",
          "startMs": 0,
          "endMs": 4000,
          "text": "गर्म करने से जल वाष्प बनता है।",
          "ratings": {
            "meaning": 5,
            "grammar": 4,
            "register": 4,
            "pedagogy": 4
          },
          "critical": false
        },
        {
          "id": "2",
          "startMs": 4500,
          "endMs": 8500,
          "text": "ठंडी सतह पर बूँदों को ध्यान से देखें।",
          "ratings": {
            "meaning": 5,
            "grammar": 4,
            "register": 4,
            "pedagogy": 4
          },
          "critical": false
        },
        {
          "id": "3",
          "startMs": 9000,
          "endMs": 12000,
          "text": "अपना अवलोकन लिखें।",
          "ratings": {
            "meaning": 5,
            "grammar": 5,
            "register": 4,
            "pedagogy": 4
          },
          "critical": false
        },
        {
          "id": "4",
          "startMs": 12500,
          "endMs": 16500,
          "text": "अपने शब्दों में परिणाम स्पष्ट करें।",
          "ratings": {
            "meaning": 4,
            "grammar": 5,
            "register": 4,
            "pedagogy": 4
          },
          "critical": false
        },
        {
          "id": "5",
          "startMs": 17000,
          "endMs": 21000,
          "text": "अपने निष्कर्ष साथी से मिलाएँ।",
          "ratings": {
            "meaning": 4,
            "grammar": 4,
            "register": 4,
            "pedagogy": 4
          },
          "critical": false
        }
      ],
      "economics": {
        "inputTokens": 1200,
        "outputTokens": 1250,
        "inputPerMillion": 0.5,
        "outputPerMillion": 1,
        "reviewMinutes": 3
      }
    },
    {
      "id": "c",
      "label": "Candidate C",
      "version": "synthetic-v1",
      "outputs": [
        {
          "id": "1",
          "startMs": 0,
          "endMs": 4000,
          "text": "गर्म करने पर पानी बर्फ बन जाता है।",
          "ratings": {
            "meaning": 0,
            "grammar": 5,
            "register": 4,
            "pedagogy": 2
          },
          "critical": true
        },
        {
          "id": "2",
          "startMs": 4500,
          "endMs": 8500,
          "text": "ठंडी सतह पर उपस्थित जल की छोटी-छोटी बूँदों का ध्यानपूर्वक अवलोकन कीजिए और हर बूँद की स्थिति भी नोट कीजिए।",
          "ratings": {
            "meaning": 4,
            "grammar": 4,
            "register": 3,
            "pedagogy": 3
          },
          "critical": false
        },
        {
          "id": "3",
          "startMs": 9000,
          "endMs": 12000,
          "text": "अपना अवलोकन लिखें।",
          "ratings": {
            "meaning": 4,
            "grammar": 5,
            "register": 4,
            "pedagogy": 4
          },
          "critical": false
        },
        {
          "id": "4",
          "startMs": 12500,
          "endMs": 16500,
          "text": "परिणाम समझाएँ।",
          "ratings": {
            "meaning": 3,
            "grammar": 5,
            "register": 4,
            "pedagogy": 3
          },
          "critical": false
        },
        {
          "id": "5",
          "startMs": 17000,
          "endMs": 21000,
          "text": "साथी से तुलना करें।",
          "ratings": {
            "meaning": 3,
            "grammar": 5,
            "register": 4,
            "pedagogy": 3
          },
          "critical": false
        }
      ],
      "economics": {
        "inputTokens": 1200,
        "outputTokens": 1600,
        "inputPerMillion": 0.2,
        "outputPerMillion": 0.6,
        "reviewMinutes": 12
      }
    }
  ]
};
