const fs = require('fs-extra');
const path = require('path');
const { imageHash } = require('image-hash');
const Jimp = require('jimp');

// Function to generate a perceptual hash for an image
function generateImageHash(filePath) {
    return new Promise((resolve, reject) => {
        imageHash(filePath, 16, true, (error, data) => {
            if (error) reject(error);
            resolve(data);
        });
    });
}

// Main function to process the images
async function processImages(folderPath) {
    const files = await fs.readdir(folderPath);
    const imageHashes = {};

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const fileStat = await fs.stat(filePath);

        if (fileStat.isFile()) {
            const hash = await generateImageHash(filePath);
            imageHashes[file] = hash;
        }
    }

    const outputPath = path.join(folderPath, 'imageHashes.json');
    await fs.writeJson(outputPath, imageHashes, { spaces: 2 });
    console.log('Hashes generated and saved to imageHashes.json');
}

// Execute the main function
const folderPath = './pics'; // Change this to your images folder path
processImages(folderPath).catch(err => console.error(err));
