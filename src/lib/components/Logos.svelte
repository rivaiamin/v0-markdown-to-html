<script>
  let { items = [] } = $props();
</script>

<section class="py-12 bg-background border-b border-border/50 overflow-hidden">
  <div class="container mx-auto px-4">
    <div class="flex flex-wrap items-center justify-center gap-12 lg:gap-20 opacity-40 hover:opacity-100 transition-opacity duration-500">
      {#each items as logo, i}
        <img 
          src={logo.src || "/placeholder.svg"} 
          alt={logo.alt} 
          class="h-10 lg:h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110" 
          data-aos="zoom-in"
          data-aos-delay={i * 50}
        />
      {/each}
    </div>
  </div>
</section>
