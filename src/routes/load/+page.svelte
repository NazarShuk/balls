<script>
	import { onMount } from 'svelte';
	import imghash from 'imghash';
	import { goto } from '$app/navigation';
    

	let status = '';

    let isBusy = false;

    let hashedImages = {}

    let prog = 0;
    

	async function fetchImages() {
        console.log('fetching images');
        isBusy = true
		status = 'fetching api (this can take a while)...';
        let inter = setInterval(() => {
            prog += 0.333
        },100)

		let response = await fetch(
			'https://script.google.com/macros/s/AKfycbxZIivOMO5f4PcFtnRU6tztU_v2Ar0fTx3G9p1lb0XbDUJfJjuvRjwMKacH6tnFXlW4Sg/exec'
		);


		let data = await response.json();
		console.log(data);
        clearInterval(inter)
		status = 'starting image download...';

		let downloadedImages = {};

		for (let i = 0; i < data.length; i++) {
			status = 'downloading image: ' + data[i].name;
			console.log('downloading image: ' + data[i].name);
			let img = await fetch(data[i].image, { mode: 'cors', referrerPolicy: 'no-referrer' });

			let blob = await img.blob();

			let reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = function () {
				let base64data = reader.result;
				downloadedImages[data[i].name] = base64data;
                prog = i / data.length * 100
			};
		}

		console.log(downloadedImages);

        status = 'waiting for image hash to start...';

        let x = 0;

		for (const [key, value] of Object.entries(downloadedImages)) {
			

			let img = new Image();
			img.src = value;
			img.onload = async function () {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');

				// Set canvas dimensions to match the image
				canvas.width = img.width;
				canvas.height = img.height;

				// Draw the image onto the canvas
				ctx.drawImage(img, 0, 0);

				// Get the image data
				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                let hashed = await imghash.hashRaw(imageData, 16);

                hashedImages[key] = hashed;
                
                status = 'proccessed image: ' + key;
			    console.log('processed image: ' + key);
                x++;
                localStorage.hashedImages = JSON.stringify(hashedImages);
                prog = x / Object.entries(downloadedImages).length * 100
                if (x == Object.entries(downloadedImages).length) {
                    status = 'done';
                    console.log(hashedImages);
                    let downloadedImages = null

                    localStorage.hashedDate = Date.now();
                    isBusy = false
                }
			};


		}

	}
</script>

<button
	style="background-color:transparent; right:0; position:fixed;"
	on:click={() => {
		goto('/');
	}}
>
	<span class="material-symbols-outlined" style="font-size: 48px; opacity: 0.5;">home</span>
</button>

<div class="center" style="flex-direction: column;">
	<h1>Load images</h1>

    <div style="width: 45vw; background-color: var(--fg-color); height: 2vw; ">
        <div style="width: {prog}%;" class="progress">
        </div>
        
    </div>
	<h2>{status}</h2>
	<button on:click={fetchImages} disabled={isBusy}>Download Images</button>
</div>

<style>
    .progress{
        background-color: var(--main-color);
        height: 100%;
        transition:0.5s; 
    }
</style>