<script>
	import { hashJson } from '$lib/index.js';
	import Dropzone from 'svelte-file-dropzone';
	import imghash from 'imghash';
	import { readAsDataURL, readAsArrayBuffer } from '$lib/utils.js';
	import { Buffer } from 'buffer';

	globalThis.Buffer = Buffer;

	console.log(hashJson);

	let file;
	let fileDataUrl;
	let selectedFileHash;

	window.addEventListener('paste', async (event) => {
		event.preventDefault();
		console.log(event.clipboardData.files[0]);
		file = event.clipboardData.files[0];

		fileDataUrl = await readAsDataURL(file);

		const img = new Image();

		// Set the src of the image to the Data URL
		img.src = fileDataUrl;

		// Define what to do when the image is loaded
		img.onload = async function () {
			// Create a canvas element
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			// Set canvas dimensions to match the image
			canvas.width = img.width;
			canvas.height = img.height;

			// Draw the image onto the canvas
			ctx.drawImage(img, 0, 0);

			// Get the image data
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

			// Now you have the ImageData object which you can use
			console.log(imageData);

			console.log(fileDataUrl);
			selectedFileHash = await imghash.hashRaw(
				imageData,
				16
			);
			console.log(selectedFileHash);
			compareHashes();
		};
	});

	// Calculate Hamming distance
	function hammingDistance(hash1, hash2) {
		let distance = 0;
		for (let i = 0; i < hash1.length; i++) {
			if (hash1[i] !== hash2[i]) {
				distance++;
			}
		}
		return distance;
	}

	let mostSimilarFile = '';
	let lowestDistance = Infinity;
    let allSimilarFiles = [];

	// Compare hashes and find the most similar
	function compareHashes() {
		lowestDistance = Infinity;
		mostSimilarFile = '';

		for (const [fileName, hash] of Object.entries(hashJson)) {
			const distance = hammingDistance(selectedFileHash, hash);
			if (distance < lowestDistance) {
				lowestDistance = distance;
				mostSimilarFile = fileName;
			}
            allSimilarFiles = [...allSimilarFiles, {fileName, distance}]
		}

		console.log(mostSimilarFile, lowestDistance, allSimilarFiles);

        allSimilarFiles.sort((a, b) => a.distance - b.distance);
	}
</script>

<div class="center" style="flex-direction: column;">
	<h0>Find the ball</h0>

	<div class="image-paste">
		{#if !file}
			<h2 style="font-size: 2vw;">Paste image</h2>

			<input type="file" style="display: none;" />
		{/if}
		{#if file}
			<img src={fileDataUrl} style="width: 100%; height:100%;" alt="File" />
		{/if}
	</div>

    
	<h1>
        {#if mostSimilarFile}
        Predicted {mostSimilarFile} with score {lowestDistance}
        {/if}
    </h1>
    
    <ul>
        {#each allSimilarFiles.slice(0,5) as {fileName, distance}}
        <li>{fileName} with score {distance}</li>
        {/each}
    </ul>
</div>

<style>
	.image-paste {
		outline: 6px var(--fg-color) dashed;
		width: 15vw;
		height: 15vw;
		margin: 0 auto;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
