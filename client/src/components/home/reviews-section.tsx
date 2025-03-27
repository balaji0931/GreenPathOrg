import { Star } from "lucide-react";

type ReviewProps = {
  text: string;
  name: string;
  role: string;
  initials: string;
}

function Review({ text, name, role, initials }: ReviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col h-full">
      <div className="flex mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-neutral-darker mb-4 flex-grow">"{text}"</p>
      <div className="flex items-center mt-auto">
        <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center mr-3">
          <span className="font-medium text-neutral-darker">{initials}</span>
        </div>
        <div>
          <h4 className="font-semibold text-neutral-darker">{name}</h4>
          <p className="text-sm text-neutral-dark">{role}</p>
        </div>
      </div>
    </div>
  );
}

export function ReviewsSection() {
  const reviews = [
    {
      text: "Green Path has completely changed how our community handles waste. The pickup service is prompt and the rewards system makes recycling fun! My children are now eco-warriors.",
      name: "Priya Sharma",
      role: "Residential Customer",
      initials: "PS"
    },
    {
      text: "As a restaurant owner, managing waste was a major challenge until we partnered with Green Path. The regular pickups and detailed recycling analytics have been game-changers.",
      name: "Rahul Patel",
      role: "Local Business Owner",
      initials: "RP"
    },
    {
      text: "The cleanup events organized through Green Path have transformed our neighborhood. We've seen greater community engagement and a visible reduction in waste.",
      name: "Maya Singh",
      role: "Community Organizer",
      initials: "MS"
    }
  ];

  return (
    <section className="py-16 bg-neutral-lightest">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">What Our Users Say</h2>
          <p className="text-neutral-dark max-w-2xl mx-auto">
            Discover how Green Path is making a difference in communities and helping 
            individuals contribute to a cleaner environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <Review 
              key={index}
              text={review.text}
              name={review.name}
              role={review.role}
              initials={review.initials}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <button 
            onClick={() => {}} 
            className="text-primary font-medium hover:underline flex items-center justify-center mx-auto"
          >
            View More Reviews
          </button>
        </div>
      </div>
    </section>
  );
}