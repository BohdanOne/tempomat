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

<main>
	<label>
		<input
			type="number"
			min="1"
			value={bpm}
			on:input="{ event => setBothFromBPM(event.target.value)}"
		/>
		BPM
	</label>

	<label>
		<input
			type="number"
			min="1"
			value={ms}
			on:input="{ event => setBothFromMs(event.target.value)}"
		/>
		MS
	</label>
		At {bpm}bpm one quarter note have a duration of {ms}ms.
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    margin: 1em 0;
    background: #230444;
    color: #d2ebe9;
    border-radius: 1em;
    box-shadow:
      5px 5px 9px hsla(269, 89%, 4%, .1),
      -5px -5px 9px hsla(269, 89%, 60%, .1);
  }

  input {
    color: #230444;
    background: #d2ebe9;
    width: 80px;
    border-radius: 1em;
    outline-color: #ed8240;
    -moz-outline-radius: 1em;
  }

  label {
    color: #d2ebe9;
  }
</style>