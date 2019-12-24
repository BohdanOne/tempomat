<script>
	import Header from './Header.svelte';
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

<Header />
<main class="App">
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
</main>

<style>
	.App {
		text-align: center;
		padding: 1rem;
		background: #D3CCE3;
  	background: -webkit-linear-gradient(to bottom, #E9E4F0, #D3CCE3);
		background: linear-gradient(to bottom, #E9E4F0, #D3CCE3);
	}

	input {
		max-width: 5rem;
		border-radius: 1rem;
		border-color: #4c00ff;
		outline-color: orange;
		-moz-outline-radius: 1rem;
	}

	label {
		color: #4c00ff;
	}
</style>