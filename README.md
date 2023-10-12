# pdfa3-maker
Convert your not-so-fancy PDF to an ISO 19005-3 specified PDF/A-3

## Assumptions

1. PDF is ready with embedded fonts and files that are necessary for safer archival before converting it to PDF/A-3.
2. PDF is available as Base64 in the project.

## Installation

You can install this package via npm:

```sh
npm install pdfa3-maker
```

## Usage

```javascript
const { makePDFA3 } = require('pdfa3-maker');
const fs = require('fs');

// Define the PDF/A-3 options
const options = {
  author: 'Your Name',
  title: 'My PDF/A-3 Document',
};

// Load a PDF from base64
const base64Pdf = '...'; // Replace with your base64-encoded PDF

makePDFA3(base64Pdf, options)
  .then((result) => {
    // `result` is the base64-encoded PDF/A-3
    // You can save it to a file or use it as needed
    fs.writeFileSync('output.pdf', result, 'base64');
  })
  .catch((error) => {
    console.error('Error:', error);
  });

```

or else you can directly receive base64 in your project:

```javascript
const pdfa3Base64 = await makePDFA3(base64Pdf, options);
```

## Options

The makePDFA3 function accepts the following options:

```console
author (string): The author's name for the PDF.
title (string): The title of the PDF document.
```

## License

This package is licensed under the MIT License.

## Contributing
If you'd like to contribute to this project, please follow these guidelines:

1. Fork the repository on GitHub.
2. Create a new branch with a meaningful name.
3. Make your changes and ensure that the code lints without errors.
4. Write tests for your changes if applicable.
5. Create a pull request, describing your changes in detail.
6. Thank you for contributing!

## Issues

If you encounter any issues or have suggestions for improvements, please open an issue on GitHub.