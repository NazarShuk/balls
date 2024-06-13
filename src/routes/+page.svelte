<script>
	import Dropzone from 'svelte-file-dropzone';
	import imghash from 'imghash';
	import { readAsDataURL, readAsArrayBuffer } from '$lib/utils.js';
	import { Buffer } from 'buffer';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';

	globalThis.Buffer = Buffer;

	let file;
	let fileDataUrl;
	let selectedFileHash;

	let hashedImages = {};
	if (localStorage.getItem('hashedImages')) {
		hashedImages = JSON.parse(localStorage.getItem('hashedImages'));
	} else {
		hashedImages = {};
	}

	function handleFileBrowse(e) {
		handleFiles(e.target.files);
	}

	async function handleFiles(files) {
		mostSimilarFile = null;
		file = files[0];
		try {
			fileDataUrl = await readAsDataURL(file);
		} catch (e) {
			toast.push('Invalid image');
		}

		const img = new Image();

		// Set the src of the image to the Data URL
		img.src = fileDataUrl;

		// Define what to do when the image is loaded
		img.onload = async function () {
			status = 'Predicting...';

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

			selectedFileHash = await imghash.hashRaw(imageData, 16);
			compareHashes();
		};
	}

	window.addEventListener('paste', async (event) => {
		event.preventDefault();

		await handleFiles(event.clipboardData.files);
	});

	onMount(() => {
		let imagePaste = document.getElementById('image-paste');

		imagePaste.addEventListener('dragover', (event) => {
			event.preventDefault();

			imagePaste.style.backgroundColor = 'var(--fg-color)';
		});
		imagePaste.addEventListener('drop', (event) => {
			event.preventDefault();
			handleFiles(event.dataTransfer.files);
			imagePaste.style.backgroundColor = 'rgba(0,0,0,0)';
		});

		imagePaste.addEventListener('dragleave', (event) => {
			event.preventDefault();
			imagePaste.style.backgroundColor = 'rgba(0,0,0,0)';
		});
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
	let status = '';

	// Compare hashes and find the most similar
	function compareHashes() {
		lowestDistance = Infinity;
		mostSimilarFile = '';
		allSimilarFiles = [];

		for (const [fileName, hash] of Object.entries(hashedImages)) {
			status = `Predicting... ${fileName}`;
			const distance = hammingDistance(selectedFileHash, hash);
			if (distance < lowestDistance) {
				lowestDistance = distance;
				mostSimilarFile = fileName;
			}
			allSimilarFiles = [...allSimilarFiles, { fileName, distance }];
		}

		console.log(mostSimilarFile, lowestDistance);

		allSimilarFiles.sort((a, b) => a.distance - b.distance);
		status = '';
	}
	function percentCloseToZero(number) {
		// Define the maximum range
		const maxRange = 100;

		// Ensure the number is within the acceptable range
		if (number < -maxRange) number = -maxRange;
		if (number > maxRange) number = maxRange;

		// Calculate the percentage closeness to zero
		const closeness = 100 - (Math.abs(number) / maxRange) * 100;

		// Ensure the result is between 0% and 100%
		return Math.max(0, Math.min(100, closeness));
	}
</script>

<title>Find the ball</title>

<button
	style="background-color:transparent; right:0; position:fixed;"
	on:click={() => {
		goto('/load');
	}}
>
	<span class="material-symbols-outlined" style="font-size: 48px; opacity: 0.5;">settings</span>
</button>

<div class="center" style="flex-direction: column;">
	<div style="display: {localStorage.hashedImages ? 'block' : 'none'};">
		<p>{status}</p>

		<div class="image-paste" id="image-paste">
			{#if !file}
				<h2 style="font-size: 2vw;">Paste image</h2>
			{/if}
			{#if file}
				<img src={fileDataUrl} style="width: 100%; height:100%;" alt="File" />
			{/if}

			<input type="file" style="display: none;" on:change={handleFileBrowse} id="file" />
			<button
				style="width: 15vw; height: 15vw; position:absolute; opacity:0;"
				on:click={() => document.getElementById('file').click()}
			></button>
		</div>

		<h1>
			{#if mostSimilarFile}
				<p>Predicted {mostSimilarFile} {percentCloseToZero(lowestDistance)}%</p>
			{/if}
		</h1>

		<ul>
			{#each allSimilarFiles.slice(0, 5) as { fileName, distance }}
				<li>{fileName} {percentCloseToZero(distance)}%</li>
			{/each}
		</ul>
	</div>
	{#if Object.entries(hashedImages).length <= 0}
		<h1>Image hashes are not loaded</h1>
		<h2><a href="/load">Click here to go to the loading page</a></h2>
	{/if}
</div>

<SvelteToast></SvelteToast>

<style>
	.image-paste {
		outline: 6px var(--fg-color) dashed;
		width: 15vw;
		height: 15vw;
		margin: 0 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		transition: 0.5s;
	}

	.onDrop {
		background-color: red;
	}
	.material-symbols-outlined {
		font-variation-settings:
			'FILL' 0,
			'wght' 400,
			'GRAD' 0,
			'opsz' 24;
	}
</style>
