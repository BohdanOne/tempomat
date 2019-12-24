<header>
  <div class="main-heading">
	  <img src="./assets/metronome.svg" alt="Colourfull metronome graphic"/>
	  <h1>Tempomat</h1>
  </div>
	<h2>Easily convert BeatsPerMinute to MilliSeconds</h2>
</header>

<style>
  header {
    background: #D3CCE3;
    background: -webkit-linear-gradient(to bottom, #E9E4F0, #D3CCE3);
    background: linear-gradient(to bottom, #E9E4F0, #D3CCE3);
    margin-bottom: 1rem;
    padding: 1rem;
  }

  .main-heading {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  h1 {
    color: #4c00ff;
    font-size: 2rem;
    font-weight: 300;
    line-height: 1.1;
    text-transform: uppercase;
    margin: 0;
  }

  h2 {
    margin: 0;
    font-size: .5rem;
    text-align: left;
    padding-left: .5rem;
  }

  img {
		height: 2rem;
    padding: .5rem;
  }

  @media (min-width: 400px) {
    h1 { font-size: 3rem;}
    h2 {
      font-size: 1rem;
      padding-left: 1rem
    }
    img {
      height: 3rem;
      padding: 1rem;
    }
  }
  @media (min-width: 500px) {
    h1{ font-size: 4rem;}
    img { height: 4rem;}
  }
</style>