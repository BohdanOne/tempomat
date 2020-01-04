<script>
  import { createEventDispatcher } from 'svelte';
  export let valueName;
  export let value;

  const dispatch = createEventDispatcher();

  function handleInput() {
    dispatch('input', { value: event.target.value });
  }
</script>

<section class="box">
  <label>
    <input
      type="number"
      min="1"
      { value }
      on:input={handleInput}
    />
    <h3>
      { valueName }
    </h3>
  </label>
</section>

<style>
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
    text-align: center;
  }


  @media (max-width: 600px) {
    input {
      font-size: 2em;
      width: 120px;
      padding: .5em 0;
      margin: 0 auto;
    }
  }
</style>