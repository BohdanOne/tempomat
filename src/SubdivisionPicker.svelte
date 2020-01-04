<script>
  import { createEventDispatcher } from 'svelte';
  export let ms;
  export let subdivision;

  const notes = ['whole', 'whole T', 'half', 'half T', 'quarter', 'quarter T', 'eight', 'eight T', 'sixteenth', 'sixteenth T', 'thirty-second', 'thirty-second T'];
  const dispatch = createEventDispatcher();

  function handleSelect() {
    dispatch('input', { value: event.target.value });
  };
</script>

<section class="box">
  <h3>Choose other subdivision:</h3>
  <select bind:value={ subdivision } on:input={ handleSelect }>
    {#each notes as note}
      <option value={ note }>
        { note }
      </option>
    {/each}
  </select>
  {ms} ms
</section>

<style>
section {
  font-weight: 300;
}
  select {
    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;
    width: 145px;
    padding: 1em;
    border: none;
    background: #230444;
    outline-color: #ed8240;
    color: #d2ebe9;
    font-family: inherit;
    font-style: italic;
    font-size: 1em;
  }
</style>