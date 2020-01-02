<header>
  <div class="main-heading">
	  <img src="./assets/metronome.svg" alt="Colourfull metronome graphic"/>
	  <h1>Tempomat</h1>
  </div>
	<h2>Easily convert BeatsPerMinute to MilliSeconds</h2>
</header>

<style>
  header {
    background: #230444;
    margin: 1em;
    padding: 1em;
    font-size: 14px;
    border-radius: 1em;
    box-shadow:
      5px 5px 9px hsla(269, 89%, 4%, .1),
      -5px -5px 9px hsla(269, 89%, 60%, .1);
  }

  .main-heading {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  h1 {
    color: #ed8240;
    font-size: 3.2em;
    font-weight: 400;
    line-height: 1.1;
    text-transform: uppercase;
    margin: 0;
  }

  h2 {
    color: #d2ebe9;
    margin: 0;
    font-size: .8em;
    font-weight: 300;
    text-align: center;
  }

  img {
		height: 2.5em;
    padding: .5em;
  }

  @media (min-width: 500px) {
    h1 { font-size: 5em; }
    img { height: 3rem; }
    h2 { font-size: 1.3em; }
  }
</style>