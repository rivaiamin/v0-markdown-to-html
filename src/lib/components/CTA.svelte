<script>
  let { title, content, link } = $props();
</script>

<section class="py-24 relative overflow-hidden">
  <div class="absolute inset-0 bg-primary/5 -z-10"></div>
  <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
  <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

  <div class="container mx-auto px-4 text-center">
    <div class="max-w-3xl mx-auto p-12 rounded-3xl border border-primary/20 bg-card/50 backdrop-blur-sm shadow-2xl" data-aos="zoom-up">
      <h3 class="text-4xl lg:text-5xl font-bold mb-6">{title}</h3>
      <p class="text-xl text-muted-foreground mb-10 leading-relaxed">
        {content}
      </p>
      {#if link}
        <a href={link.href} class="inline-block px-10 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-full hover:scale-105 transition-transform shadow-xl shadow-primary/30">
          {link.label}
        </a>
      {/if}
    </div>
  </div>
</section>
