<script>
  import { createEventDispatcher } from 'svelte';

  export let valueName;
  export let value;

  const dispatch = createEventDispatcher();

  function handleInput() {
    dispatch('input', { value: event.target.value });
  }
</script>

<section>
  <label>
    <input
      type="number"
      min="1"
      { value }
      on:input={handleInput}
    />
    <p>
      { valueName }
    </p>
  </label>
</section>

<style>
  section {
    width: 38%;
    text-align: center;
    padding: 2em;
    margin: 1em 0;
    background: #230444;
    color: #d2ebe9;
    border-radius: 1em;
    box-shadow:
      5px 5px 9px hsla(269, 89%, 4%, .1),
      -5px -5px 9px hsla(269, 89%, 60%, .1);
  }

  input {
    color: #d2ebe9;
    background: #230444;
    width: 200px;
    padding: .5em .1em;
    font-family: inherit;
    font-size: 4em;
    font-weight: 600;
    border: none;
    outline-color: #ed8240;
    -moz-outline-radius: 5px;
    text-align: center;
  }

  label {
    color: #d2ebe9;
    display: block;
    font-family: inherit;
    font-weight: 300;
  }
</style>