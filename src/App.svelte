<script>
	let bpm = 120;
	let ms = 60000 / bpm;
</script>

<header>
	<h1>Tempomat</h1>
	<h2>Convert BPM to MS</h2>
</header>
<main>
	<label>
		<input type="number" bind:value={bpm}>
		bpm
	</label>
	<label>
		At {bpm} one quarter note have a duration of {ms}ms.
	</label>
	<!-- <img src={metronome} alt="Colourfull metronome graphic"/> -->
</main>

<style>
	main,
	header {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
	}

	h1 {
		color: #4c00ff;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 300;
	}

	input {
		max-width: 100px;
		border-radius: 1em;
		outline-color: orange;
		-moz-outline-radius: 1em;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>