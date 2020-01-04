<script>
	import ValueBox from './ValueBox.svelte';
	import SubdivisionPicker from './SubdivisionPicker.svelte';
	import TempoMarkings from './TempoMarkings.svelte';

	let bpm = 120;
	let ms = 500;
	let subdivision = 'quarter';
	$: msTable = {
		'whole' : ms * 4,
		'whole T' : Math.round((ms * 8) / 3),
		'half' : ms * 2,
		'half T' : Math.round((ms * 4) / 3),
		'quarter' : ms,
		'quarter T' : Math.round((ms * 2) / 3),
		'eight': ms / 2,
		'eight T': Math.round(ms / 3),
		'sixteenth': ms / 4,
		'sixteenth T': Math.round((ms / 2) / 3),
		'thirty-second': ms / 8,
		'thirty-second T': Math.round((ms / 4) / 3)
	};

	function setBothFromBPM(event) {
		bpm = +event.detail.value;
		ms = Math.round(60000 / bpm);
	};

	function setBothFromMs(event) {
		ms = +event.detail.value;
		bpm = Math.round((60 / ms) * 1000);
	};

	function setSubdivision(event) {
		subdivision = event.detail.value;
	};
</script>

<main>
	<ValueBox
		valueName="Beats Per Minute"
		value={ bpm }
		on:input={ setBothFromBPM }
	/>
	<ValueBox
		valueName="Milliseconds (quarter note)"
		value={ ms }
		on:input={ setBothFromMs }
	/>
	<SubdivisionPicker
		{subdivision}
		ms={msTable[subdivision]}
		on:input={setSubdivision}
	/>
	<TempoMarkings {bpm} />
</main>

<style>
	main {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: 1em;
	}

	@media (max-width: 600px) {
		main { grid-template-columns: 1fr; }
	}
</style>