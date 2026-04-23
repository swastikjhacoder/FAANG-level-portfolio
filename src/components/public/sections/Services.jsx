import React from "react";
import Image from "next/image";
import RibbonCard from "@/components/public/ui/RibbonCard";

const Services = ({ data = [] }) => {
  if (!data.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((service) => (
        <RibbonCard key={service._id}>
          <div className="space-y-4">
            {service.icon?.url && (
              <div className="w-12 h-12 relative">
                <Image
                  src={service.icon.url}
                  alt={service.heading}
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
            )}

            <h3 className="text-lg font-semibold">{service.heading}</h3>

            {service.subheading && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {service.subheading}
              </p>
            )}

            {service.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {service.description}
              </p>
            )}
          </div>
        </RibbonCard>
      ))}
    </div>
  );
};

export default Services;
