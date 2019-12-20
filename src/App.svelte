<script>
	let bpm = 120;
	let ms = 500;

	function setBothFromBPM(value) {
		bpm = +value;
		ms = Math.round(60000 / bpm);
	}

	function setBothFromMs(value) {
		ms = +value;
		bpm = Math.round((60 / ms) * 1000);
	}

</script>

<header>
	<h1>Tempomat</h1>
	<h2>Convert BeatsPerMinute to MilliSeconds</h2>
</header>
<main>
	<label>
		<input
			type="number"
			min="1"
			value={bpm}
			on:input="{ event => setBothFromBPM(event.target.value)}"
		/>
		bpm
	</label>

	<label>
		<input
			type="number"
			min="1"
			value={ms}
			on:input="{ event => setBothFromMs(event.target.value)}"
		/>
		ms
	</label>
		At {bpm}bpm one quarter note have a duration of {ms}ms.
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
		max-width: 5em;
		border-radius: 1em;
		border-color: #4c00ff;
		outline-color: orange;
		-moz-outline-radius: 1em;
	}

	label {
		color: #4c00ff;
	}
</style>