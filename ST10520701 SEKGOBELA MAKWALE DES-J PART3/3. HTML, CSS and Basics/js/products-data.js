/* =========================================================================
   DES-LUX PLAY | js/products-data.js
   -------------------------------------------------------------------------
   The catalogue. To add a toy, copy one object, give it a unique id and
   fill in the fields. products.js builds the cards from this list.
   price is a number used for sorting and the price filter (null = not yet
   announced); priceLabel is the text shown to visitors; image may be null.
   ========================================================================= */
window.DLP_PRODUCTS = [
  {
    "id": "classic-bear",
    "name": "The Classic Bear",
    "category": "standard",
    "price": 350,
    "priceLabel": "From R350",
    "status": "Available in multiple sizes and colours",
    "summary": "Chestnut brown teddy with a hand-tied satin gold bow.",
    "description": "A timeless teddy bear crafted from the finest materials. Perfect for gifts, nurseries and everyday comfort.",
    "details": [
      "Available in multiple sizes and colours",
      "Hand-tied satin gold bow",
      "Handmade in Burgersfort, Limpopo"
    ],
    "image": {
      "src": "images/standard-collection-chestnut-teddy-bear.webp",
      "alt": "Premium chestnut brown teddy bear with hand-tied satin gold bow",
      "width": 900,
      "height": 900
    },
    "enquiryToy": "bear",
    "tags": [
      "teddy",
      "bear",
      "gift",
      "nursery",
      "brown"
    ]
  },
  {
    "id": "velvet-bunny",
    "name": "The Velvet Bunny",
    "category": "standard",
    "price": 300,
    "priceLabel": "From R300",
    "status": "Available in multiple sizes and colours",
    "summary": "A soft velvet bunny for nurseries and gifting.",
    "description": "Beautifully designed and available in multiple sizes and colours. Perfect for gifts, nurseries and everyday comfort.",
    "details": [
      "Available in multiple sizes and colours",
      "Handmade in Burgersfort, Limpopo"
    ],
    "image": {
      "src": "images/velvet-bunny-pastel-pink-plush.webp",
      "alt": "Soft dusty-rose velvet bunny plush with long ears, shown beside a pastel colour card",
      "width": 900,
      "height": 900
    },
    "enquiryToy": "bunny",
    "tags": [
      "bunny",
      "rabbit",
      "velvet",
      "gift",
      "nursery"
    ]
  },
  {
    "id": "cuddle-elephant",
    "name": "The Cuddle Elephant",
    "category": "standard",
    "price": 400,
    "priceLabel": "From R400",
    "status": "Available in multiple sizes and colours",
    "summary": "A cuddly elephant companion for everyday comfort.",
    "description": "Beautifully designed and available in multiple sizes and colours. Perfect for gifts, nurseries and everyday comfort.",
    "details": [
      "Available in multiple sizes and colours",
      "Handmade in Burgersfort, Limpopo"
    ],
    "image": {
      "src": "images/cuddle-elephant-grey-plush.webp",
      "alt": "Soft grey cuddle elephant plush shown beside a pastel colour card",
      "width": 900,
      "height": 900
    },
    "enquiryToy": "other",
    "tags": [
      "elephant",
      "cuddle",
      "gift",
      "nursery"
    ]
  },
  {
    "id": "custom-dragon",
    "name": "Custom Creation: Dragon",
    "category": "custom",
    "price": 500,
    "priceLabel": "Starting at R500",
    "status": "Made to order, 7–14 business days",
    "summary": "Emerald green dragon with embroidered scales, designed with you.",
    "description": "Have a specific character in mind? Work with us to bring your imagination to life. Choose the animal, colours, size, embroidery, and add a personalized message.",
    "details": [
      "Choose the animal, colours and size",
      "Embroidery and personalized messages available",
      "Turnaround: 7–14 business days",
      "Deposit: 50% required to confirm"
    ],
    "image": {
      "src": "images/custom-emerald-dragon-plush.webp",
      "alt": "Vibrant emerald green custom dragon stuffed toy with embroidered scales",
      "width": 900,
      "height": 900
    },
    "enquiryToy": "dragon",
    "tags": [
      "dragon",
      "custom",
      "personalised",
      "embroidery",
      "green",
      "fantasy"
    ]
  },
  {
    "id": "custom-unicorn",
    "name": "Custom Creation: Unicorn",
    "category": "custom",
    "price": 500,
    "priceLabel": "Starting at R500",
    "status": "Made to order, 7–14 business days",
    "summary": "Vibrant purple unicorn, with name embroidery on request.",
    "description": "Design your dream toy from shape to stitching. Choose colours, embroidery, and add personalized messages for a one-of-a-kind companion.",
    "details": [
      "Choose the animal, colours and size",
      "Name embroidery available",
      "Turnaround: 7–14 business days",
      "Deposit: 50% required to confirm"
    ],
    "image": {
      "src": "images/custom-purple-unicorn-plush.webp",
      "alt": "Vibrant customized purple unicorn stuffed toy",
      "width": 900,
      "height": 900
    },
    "enquiryToy": "unicorn",
    "tags": [
      "unicorn",
      "custom",
      "personalised",
      "embroidery",
      "purple",
      "fantasy"
    ]
  },
  {
    "id": "golden-lion",
    "name": "The Golden Lion",
    "category": "limited",
    "price": 1200,
    "priceLabel": "R1,200",
    "status": "August Drop | Only 50 made",
    "summary": "Exclusive golden lion in luxury packaging.",
    "description": "A small-batch release for the serious collector. Once they are gone, they are gone forever.",
    "details": [
      "August Drop",
      "Only 50 made",
      "Luxury packaging"
    ],
    "image": {
      "src": "images/limited-edition-golden-lion-plush.webp",
      "alt": "Exclusive golden lion stuffed toy displayed in a velvet-lined luxury box",
      "width": 900,
      "height": 900
    },
    "enquiryToy": null,
    "tags": [
      "lion",
      "golden",
      "limited",
      "collector",
      "exclusive"
    ]
  },
  {
    "id": "silver-fox",
    "name": "The Silver Fox",
    "category": "limited",
    "price": null,
    "priceLabel": "Price to be announced",
    "status": "September Drop | Coming soon",
    "summary": "The next small-batch release for collectors.",
    "description": "Small-batch releases are available for a limited time only. Once they are gone, they are gone forever.",
    "details": [
      "September Drop",
      "Coming soon"
    ],
    "image": {
      "src": "images/silver-fox-limited-edition-plush.webp",
      "alt": "Silver fox stuffed toy in a navy luxury gift box with satin lining and Des-Lux Play branding",
      "width": 900,
      "height": 900
    },
    "enquiryToy": null,
    "tags": [
      "fox",
      "silver",
      "limited",
      "collector",
      "coming soon"
    ]
  }
];
