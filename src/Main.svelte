<script>
	import ValueBox from './ValueBox.svelte';

	let bpm = 120;
	let ms = 500;

	function setBothFromBPM(event) {
		bpm = +event.detail.value;
		ms = Math.round(60000 / bpm);
	}

	function setBothFromMs(event) {
		ms = +event.detail.value;
		bpm = Math.round((60 / ms) * 1000);
  }

</script>

<main>
	<ValueBox
		valueName="Beats Per Minute"
		value={ bpm }
		on:input={ setBothFromBPM }
	/>
	<ValueBox
		valueName="Milliseconds"
		value={ ms }
		on:input={ setBothFromMs }
	/>

		<!-- At {bpm}bpm one quarter note have a duration of {ms}ms. -->
</main>

<style>
	main {
		display: flex;
		justify-content: space-between;
		overflow: visible;
	}
</style>