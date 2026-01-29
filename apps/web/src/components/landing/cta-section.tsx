export const CTASection = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Build fast without the boilerplate.
          </h2>
          <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
            Auth, database, API, web, and mobile are already wired. Replace the
            UI and ship your product.
          </p>
        </div>
      </div>
    </section>
  );
};
