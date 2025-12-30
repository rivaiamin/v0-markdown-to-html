<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import AOS from 'aos';
  import 'aos/dist/aos.css';

  let { children } = $props();

  onMount(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });
  });
</script>

<div class="min-h-screen bg-background text-foreground font-sans">
  {@render children()}
</div>
