<script>
  export let bpm;
  $: tempo = defineTempo(bpm);

  function defineTempo(bpm) {
      if (bpm < 25) return 'Larghissimo';
      if (bpm < 45) return 'Grave';
      if (bpm < 60) return 'Largo / Lento';
      if (bpm < 66) return 'Larghetto';
      if (bpm < 76) return 'Adagio';
      if (bpm < 108) return 'Andante';
      if (bpm < 120) return 'Moderato';
      if (bpm < 156) return 'Allegro';
      if (bpm < 176) return 'Vivace';
      if (bpm < 200) return 'Presto';
      if (bpm <= 200) return 'Prestissimo';
      else return 'choose your tempo';
    }
</script>

<section>
  <p>
    This is in range of <span>{ tempo }</span> tempo marking.
  </p>
</section>

<style>
  section {
    font-weight: 300;
    max-width: 600px;
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

  span {
    font-style: italic;
  }
</style>