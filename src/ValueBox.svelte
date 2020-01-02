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
    <h2>
      { valueName }
    </h2>
  </label>
</section>

<style>
  section {
    width: 38%;
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

  h2 {
    color: #d2ebe9;
    display: block;
    font-family: inherit;
    font-size: 1em;
    font-weight: 300;
  }
  @media (max-width: 500px) {
    input {
      font-size: 2em;
      width: 120px;
      padding: .5em 0;
      margin: 0 auto;
    }
  }
</style>