import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Ticket, Star, Shield, ExternalLink, CircleCheck, Smartphone, Mail, Package } from "lucide-react";
import { SiTicketmaster } from "react-icons/si";
import type { TicketListing } from "@shared/schema";
import { motion } from "framer-motion";
import { formatCurrency } from "@/hooks/use-location-detection";

interface TicketListingCardProps {
  listing: TicketListing;
  currency?: string;
}

export function TicketListingCard({ listing, currency = "USD" }: TicketListingCardProps) {
  const getBrokerIcon = (broker: string) => {
    switch (broker) {
      case "ticketmaster":
        return <SiTicketmaster className="h-3 w-3" />;
      case "stubhub":
        return <Ticket className="h-3 w-3" />;
      case "seatgeek":
        return <CircleCheck className="h-3 w-3" />;
      default:
        return <Ticket className="h-3 w-3" />;
    }
  };

  const getBrokerColor = (broker: string) => {
    switch (broker) {
      case "ticketmaster":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "stubhub":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "seatgeek":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        className={cn(
          "overflow-hidden hover-elevate transition-all",
          !listing.available && "opacity-50"
        )}
        data-testid={`ticket-listing-${listing.id}`}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-xs gap-1", getBrokerColor(listing.broker))}>
                {getBrokerIcon(listing.broker)}
                {listing.broker.charAt(0).toUpperCase() + listing.broker.slice(1)}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                <Shield className="h-3 w-3 mr-0.5" />
                Verified
              </Badge>
            </div>
            {listing.rating && (
              <div className="flex items-center gap-0.5 text-amber-500">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-xs font-medium">{listing.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Seat Details */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <p className="text-lg font-bold">Section {listing.section}</p>
              <p className="text-sm text-muted-foreground">
                Row {listing.row} · {listing.seats} {listing.seats === 1 ? "Ticket" : "Tickets"}
              </p>
            </div>
            {listing.seatView && (
              <div className="w-16 h-12 rounded-md overflow-hidden bg-muted">
                <img
                  src={listing.seatView}
                  alt="Seat view"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold">
                {formatCurrency(listing.price, currency)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(listing.totalPrice, currency)} total with fees
              </p>
            </div>
            <Button
              disabled={!listing.available}
              className="gap-1"
              data-testid={`button-buy-ticket-${listing.id}`}
            >
              <Ticket className="h-4 w-4" />
              {listing.available ? "Buy Now" : "Sold Out"}
              {listing.available && <ExternalLink className="h-3 w-3 ml-1" />}
            </Button>
          </div>

          {/* Delivery Type */}
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {listing.deliveryType === "mobile" && (
                <>
                  <Smartphone className="h-3 w-3" />
                  Mobile delivery
                </>
              )}
              {listing.deliveryType === "electronic" && (
                <>
                  <Mail className="h-3 w-3" />
                  Email delivery
                </>
              )}
              {listing.deliveryType === "physical" && (
                <>
                  <Package className="h-3 w-3" />
                  Physical tickets
                </>
              )}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

interface TicketMarketplaceProps {
  listings: TicketListing[];
  currency?: string;
}

export function TicketMarketplace({ listings, currency = "USD" }: TicketMarketplaceProps) {
  const sortedListings = [...listings].sort((a, b) => a.price - b.price);
  const bestDeal = sortedListings[0];

  return (
    <div className="space-y-4" data-testid="ticket-marketplace">
      {/* Best Deal Banner */}
      {bestDeal && (
        <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 text-white">Best Deal</Badge>
              <span className="text-sm">
                Section {bestDeal.section} starting at{" "}
                <span className="font-bold">{formatCurrency(bestDeal.price, currency)}</span>
              </span>
            </div>
            <Button size="sm" variant="default" className="bg-green-500 hover:bg-green-600">
              View Deal
            </Button>
          </div>
        </div>
      )}

      {/* Listings Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {listings.map((listing) => (
          <TicketListingCard key={listing.id} listing={listing} currency={currency} />
        ))}
      </div>

      {listings.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No tickets available</p>
          <p className="text-sm">Check back later for ticket listings</p>
        </div>
      )}
    </div>
  );
}
