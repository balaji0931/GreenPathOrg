export function AboutSection() {
  return (
    <section className="bg-gradient-to-r from-primary to-[#558B2F] text-white py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl">
          <h1 className="font-bold text-3xl md:text-5xl mb-6 leading-tight">About Green Path</h1>
          <p className="text-lg opacity-95 mb-6">
            Green Path is a community-driven waste management and donation platform designed to reduce waste, promote recycling, and support those in need.
          </p>
          <p className="opacity-90 mb-4">
            We connect customers, dealers, and organizations to create a sustainable and responsible way of handling waste. Our platform encourages users to segregate waste, schedule pickups, and donate reusable items to orphanages, old-age homes, and shelters—transforming discarded materials into valuable resources for the community.
          </p>
          <p className="opacity-90 mb-4">
            Beyond waste collection, Green Path fosters social engagement by allowing users to join cleanup drives, participate in environmental initiatives, and earn social points for their contributions. With an informative media section, users can learn about composting, waste segregation, and the latest sustainability practices.
          </p>
          <p className="opacity-90 font-medium">
            At Green Path, we believe in empowering individuals and organizations to make a real difference—because a cleaner world starts with small, collective actions.
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
          <path fill="#FAFAFA" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </section>
  );
}
