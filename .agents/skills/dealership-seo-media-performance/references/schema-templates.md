# Schema.org Structured Data Templates for Gabriel Motos

Use these JSON-LD templates within the `<head>` of the website to enable rich search snippets in Google and other search engines.

## 1. Dealership Organization Schema (`AutoDealer` / `AutomotiveBusiness`)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  "name": "Gabriel Motos",
  "image": "logo gabriel motos.png",
  "telephone": "+55 11 99999-9999",
  "url": "https://gabrielmotos.com.br",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Av. Principal das Motos, 1000",
    "addressLocality": "São Paulo",
    "addressRegion": "SP",
    "postalCode": "01000-000",
    "addressCountry": "BR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -23.55052,
    "longitude": -46.633308
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "08:30",
      "closes": "18:30"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "09:00",
      "closes": "14:00"
    }
  ],
  "priceRange": "$$$$"
}
</script>
```

## 2. Featured Vehicle Listing Schema (`Vehicle` / `Product`)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Vehicle",
  "name": "BMW S1000RR 2024",
  "vehicleModelDate": "2024",
  "mileageFromOdometer": {
    "@type": "QuantitativeValue",
    "value": "2500",
    "unitCode": "KMT"
  },
  "vehicleEngine": {
    "@type": "EngineSpecification",
    "engineDisplacement": {
      "@type": "QuantitativeValue",
      "value": "999",
      "unitCode": "CMQ"
    },
    "enginePower": {
      "@type": "QuantitativeValue",
      "value": "210",
      "unitText": "cv"
    }
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "BRL",
    "price": "125000.00",
    "itemCondition": "https://schema.org/UsedCondition",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "AutoDealer",
      "name": "Gabriel Motos"
    }
  }
}
</script>
```
