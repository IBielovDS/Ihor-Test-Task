// Moving that code from old theme, didn't have lot of time to refactor it so since that it might look a bit messy.
async function initializeCountryCode() {
  const countries = {
    "AU": ["Australia"],
    "UK": ["United Kingdom"],
    "CA": ["Canada"],
    "EU": [
      "Austria", "Belgium", "Croatia", "Czechia", "Denmark", "Finland", "France",
      "Germany", "Greece", "Hungary", "Ireland", "Italy", "Netherlands", "Poland",
      "Romania", "Spain", "Bulgaria", "Estonia", "Latvia", "Lithuania", "Luxembourg",
      "Malta", "Portugal", "Slovakia", "Slovenia"
    ]
  };

  try {
    const req = await fetch('/browsing_context_suggestions.json');
    const res = await req.json();
    const countryName = res.detected_values.country_name;
    let countryCode = "Shipbob";

    for (const [key, names] of Object.entries(countries)) {
      if (names.includes(countryName)) {
        countryCode = key;
        break;
      }
    }

    window.countryCode = countryCode;
    window.dispatchEvent(new CustomEvent('countryCodeSet', { detail: countryCode }));
  } catch (err) {
    console.error('Error detecting country:', err);
    window.countryCode = "Shipbob";
    window.dispatchEvent(new CustomEvent('countryCodeSet', { detail: "Shipbob" }));
  }
}

document.addEventListener('DOMContentLoaded', initializeCountryCode);