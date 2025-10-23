import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Gift, Truck, Zap } from 'lucide-react';

const PromoCarousel = () => {
  const base_url = import.meta.env.VITE_BASE_URL;
  const [promoData, setPromoData] = useState([]);
  const [loading, setLoading] = useState(true);

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${base_url}/promo-data`);
        setPromoData(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [base_url]);

  const showToast = () => {
    toast({
      title: "এই ফিচারটি এখনও চালু হয়নি—তবে চিন্তা করবেন না! আপনি পরবর্তী প্রম্পটে এটি যোগ করার জন্য অনুরোধ করতে পারেন!"
    });
  };

  const getIcon = (name) => {
    switch (name) {
      case 'Zap': return <Zap className="h-8 w-8" />;
      case 'Truck': return <Truck className="h-8 w-8" />;
      case 'Gift': return <Gift className="h-8 w-8" />;
      default: return <Zap className="h-8 w-8" />;
    }
  };

  if (loading) return <div className="text-center py-8">Loading promos...</div>;

  if (promoData.length === 0) {
    return <div className="text-center py-8 text-gray-500">No active promotions</div>;
  }

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          opts={{ align: "start", loop: true }}
          onMouseEnter={() => plugin.current.stop()}
          onMouseLeave={() => plugin.current.reset()}
        >
          <CarouselContent className="-ml-4">
            {promoData.map((promo, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card
                    className="overflow-hidden rounded-lg shadow-sm"
                    style={{
                      backgroundColor: promo.bgColor,
                      color: promo.textColor,
                    }}
                  >
                    <CardContent className="flex flex-col text-white items-center justify-center p-6 space-y-4">
                      <div className="flex items-center space-x-4">
                        <div style={{ filter: `invert(${promo.textColor === '#ffffff' ? 1 : 0})` }}>
                          {getIcon(promo.icon)}
                        </div>
                        <span className="text-2xl font-bold">{promo.discount}</span>
                      </div>
                      <motion.button
                        onClick={showToast}
                        className="px-6 py-2 rounded-full font-semibold transition-transform"
                        style={{
                          backgroundColor: promo.buttonColor,
                          color: promo.textColor === '#000000' ? '#ffffff' : '#000000',
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {promo.cta}
                      </motion.button>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default PromoCarousel;