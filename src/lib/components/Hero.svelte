<script>
  let { title, content, links = [], image } = $props();
</script>

<section class="relative py-20 lg:py-32 overflow-hidden border-b border-border/50">
  <div class="container mx-auto px-4 relative z-10">
    <div class="flex flex-col lg:flex-row items-center gap-12">
      <div class="flex-1 text-center lg:text-left" data-aos="fade-right">
        <h1 class="text-5xl lg:text-7xl font-bold tracking-tight mb-6 bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          {title}
        </h1>
        <p class="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
          {content}
        </p>
        <div class="flex flex-wrap gap-4 justify-center lg:justify-start">
          {#each links as link}
            <a href={link.href} class="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              {link.label}
            </a>
          {/each}
        </div>
      </div>
      {#if image}
        <div class="flex-1 w-full max-w-xl" data-aos="fade-left">
          <div class="relative group">
             <div class="absolute -inset-1 bg-linear-to-r from-blue-500 to-emerald-500 rounded-2xl blur-md opacity-25 group-hover:opacity-50 transition duration-1000"></div>
             <img src={image || "/placeholder.svg"} alt={title} class="relative rounded-2xl shadow-2xl border border-border/50 bg-card object-cover w-full h-auto aspect-video" />
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
