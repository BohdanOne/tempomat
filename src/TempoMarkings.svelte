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

<section class="box">
  <h3>Current Tempo Marking</h3>
  <p>
    { tempo }
  </p>
</section>

<style>
  p {
    font-style: italic;
    font-weight: 300;
    margin-top: 1em;
  }
</style>