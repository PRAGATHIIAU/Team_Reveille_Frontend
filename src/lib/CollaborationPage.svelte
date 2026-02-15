<script>
  import { currentView } from './stores/viewStore.js';

  let { title = '', content = '' } = $props();

  function goBack(e) {
    e.preventDefault();
    currentView.set('landing');
  }
</script>

<div class="collab-page">
  <div class="collab-inner">
    <a href="#" class="back-link" onclick={goBack}>
      <span class="back-arrow">←</span>
      Back to home
    </a>

    <div class="card">
    <div class="card-glow" aria-hidden="true"></div>
    <div class="title-wrap">
      <h1 class="collab-title">{title}</h1>
      <span class="title-emoji" aria-hidden="true">
        {#if title === 'Events'}
          📅
        {:else if title === 'Mentorship'}
          🤝
        {:else}
          🏆
        {/if}
      </span>
    </div>
    <p class="collab-content">{content}</p>
    <div class="floating-dots" aria-hidden="true">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
  </div>
</div>

<style>
  .collab-page {
    width: 100%;
    min-height: 100vh;
    min-height: 100dvh;
    padding: 2.5rem 1.5rem;
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: linear-gradient(160deg, #faf8f6 0%, #f0ebe6 40%, #e8e0d8 100%);
    color: #1a1a1a;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
  }

  .collab-inner {
    max-width: 640px;
    margin: 0 auto;
  }

  .collab-page::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 80%;
    height: 80%;
    background: radial-gradient(ellipse, rgba(80, 0, 0, 0.04) 0%, transparent 70%);
    pointer-events: none;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 2rem;
    font-size: 0.95rem;
    color: #500000;
    text-decoration: none;
    font-weight: 600;
    letter-spacing: 0.02em;
    transition: transform 0.25s ease, color 0.2s ease;
  }

  .back-link:hover {
    color: #3d0000;
    transform: translateX(-4px);
  }

  .back-link:active {
    transform: translateX(-2px);
  }

  .back-arrow {
    display: inline-block;
    transition: transform 0.3s ease;
  }

  .back-link:hover .back-arrow {
    animation: wiggle 0.5s ease;
  }

  @keyframes wiggle {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    75% { transform: translateX(2px); }
  }

  .card {
    position: relative;
    background: #fff;
    border-radius: 20px;
    padding: 2.5rem 2rem;
    box-shadow:
      0 4px 6px rgba(80, 0, 0, 0.04),
      0 12px 24px rgba(80, 0, 0, 0.06),
      0 0 0 1px rgba(80, 0, 0, 0.06);
    animation: cardIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    overflow: hidden;
  }

  @keyframes cardIn {
    from {
      opacity: 0;
      transform: translateY(24px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .card-glow {
    position: absolute;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(198, 140, 83, 0.15) 0%, transparent 70%);
    animation: glowPulse 4s ease-in-out infinite;
  }

  @keyframes glowPulse {
    0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
    50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
  }

  .title-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
  }

  .collab-title {
    margin: 0;
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    font-weight: 800;
    color: #500000;
    letter-spacing: -0.02em;
    animation: titleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
  }

  @keyframes titleIn {
    from {
      opacity: 0;
      transform: translateY(-12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .title-emoji {
    font-size: 2rem;
    animation: emojiBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s both, float 3s ease-in-out 1s infinite;
  }

  @keyframes emojiBounce {
    from {
      opacity: 0;
      transform: scale(0) rotate(-20deg);
    }
    to {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  .collab-content {
    margin: 0;
    font-size: clamp(1.5rem, 4vw, 2.25rem);
    line-height: 1.6;
    color: #4a4a4a;
    text-align: center;
    animation: contentIn 0.5s ease 0.3s both;
  }

  @keyframes contentIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .floating-dots {
    position: absolute;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #c68c53;
    opacity: 0.6;
    animation: dotBounce 1.2s ease-in-out infinite;
  }

  .dot:nth-child(1) { animation-delay: 0s; }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes dotBounce {
    0%, 100% { transform: translateY(0); opacity: 0.6; }
    50% { transform: translateY(-6px); opacity: 1; }
  }
</style>
