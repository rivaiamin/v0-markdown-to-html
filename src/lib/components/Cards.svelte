<script>
  let { title, items = [] } = $props();
</script>

<section class="py-24 bg-background/50 border-b border-border/50">
  <div class="container mx-auto px-4">
    <div class="text-center mb-16" data-aos="fade-up">
      <h2 class="text-3xl lg:text-5xl font-bold mb-4">{title}</h2>
      <div class="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each items as item, i}
        <div 
          class="group bg-card p-8 rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 flex flex-col h-full"
          data-aos="fade-up"
          data-aos-delay={i * 100}
        >
          {#if item.image}
            <img src={item.image || "/placeholder.svg"} alt={item.title} class="w-full h-48 object-cover rounded-xl mb-6 border border-border/50" />
          {/if}
          <h3 class="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
          <p class="text-muted-foreground mb-6 flex-grow leading-relaxed">{item.text}</p>
          {#if item.link}
            <a href={item.link.href} class="inline-flex items-center text-primary font-semibold hover:underline group/link">
              {item.link.label}
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-2 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>
