const fs = require('fs-extra');
const path = require('path');
const { imageHash } = require('image-hash');

// Function to generate a perceptual hash for an image
function generateImageHash(filePath) {
    return new Promise((resolve, reject) => {
        imageHash(filePath, 16, true, (error, data) => {
            if (error) reject(error);
            resolve(data);
        });
    });
}

// Function to calculate the Hamming distance between two hashes
function hammingDistance(hash1, hash2) {
    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] !== hash2[i]) {
            distance++;
        }
    }
    return distance;
}

// Function to find the most similar hash
async function findMostSimilarHash(jsonFilePath, imagePath) {
    // Read the JSON file containing the hashes
    const imageHashes = await fs.readJson(jsonFilePath);

    // Generate the perceptual hash for the provided image
    const imageHash = await generateImageHash(imagePath);

    // Initialize the variables to track the most similar hash
    let mostSimilarFile = null;
    let lowestDistance = Infinity;

    // Compare the generated hash with the hashes in the JSON file
    for (const [fileName, hash] of Object.entries(imageHashes)) {
        const distance = hammingDistance(imageHash, hash);
        if (distance < lowestDistance) {
            lowestDistance = distance;
            mostSimilarFile = fileName;
        }
    }

    if (mostSimilarFile !== null) {
        console.log(`The most similar file is: ${mostSimilarFile} with a Hamming distance of: ${lowestDistance}`);
    } else {
        console.log('No similar files found.');
    }
}

// Execute the function
const jsonFilePath = './imageHashes.json'; // Path to the JSON file with hashes
const imagePath = './image.png'; // Path to the image to compare

findMostSimilarHash(jsonFilePath, imagePath).catch(err => console.error(err));
