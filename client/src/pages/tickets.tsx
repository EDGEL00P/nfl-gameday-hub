import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { TicketListingCard, TicketMarketplace } from "@/components/ticket-listing";
import { Ticket, Search, Filter, SlidersHorizontal, MapPin, Calendar, DollarSign, Shield, Lock, Smartphone, Star, CircleCheck, Globe } from "lucide-react";
import { SiTicketmaster } from "react-icons/si";
import type { TicketListing, NFLGame } from "@shared/schema";
import { NFL_TEAMS } from "@/lib/nfl-teams";
import { useLocationDetection, formatCurrency } from "@/hooks/use-location-detection";
import { motion } from "framer-motion";

export default function Tickets() {
  const { location } = useLocationDetection();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedBroker, setSelectedBroker] = useState("all");

  const { data: listings = [], isLoading } = useQuery<TicketListing[]>({
    queryKey: ["/api/tickets", selectedTeam, priceRange, selectedBroker],
  });

  const filteredListings = listings.filter(listing => {
    const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1];
    const matchesBroker = selectedBroker === "all" || listing.broker === selectedBroker;
    return matchesPrice && matchesBroker;
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            Ticket Marketplace
          </h1>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
            Find tickets from verified brokers · <Globe className="h-3 w-3 inline" /> Prices in {location.currency}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Team Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Team</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger data-testid="select-ticket-team">
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {NFL_TEAMS.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      <div className="flex items-center gap-2">
                        <img src={team.logo} alt={team.name} className="w-4 h-4" />
                        {team.shortDisplayName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Broker Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Broker</label>
              <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                <SelectTrigger data-testid="select-ticket-broker">
                  <SelectValue placeholder="All Brokers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brokers</SelectItem>
                  <SelectItem value="ticketmaster">Ticketmaster</SelectItem>
                  <SelectItem value="stubhub">StubHub</SelectItem>
                  <SelectItem value="seatgeek">SeatGeek</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>Price Range</span>
                <span className="text-muted-foreground">
                  {formatCurrency(priceRange[0], location.currency)} - {formatCurrency(priceRange[1], location.currency)}
                </span>
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={1000}
                step={25}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Broker Badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1">
          <SiTicketmaster className="h-3 w-3" />
          Ticketmaster - Official Partner
        </Badge>
        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20 gap-1">
          <Ticket className="h-3 w-3" />
          StubHub - Verified Seller
        </Badge>
        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 gap-1">
          <CircleCheck className="h-3 w-3" />
          SeatGeek - Deal Score
        </Badge>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredListings.length} {filteredListings.length === 1 ? "listing" : "listings"} found
            </p>
            <Select defaultValue="price-low">
              <SelectTrigger className="w-[180px]" data-testid="select-ticket-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Best Rating</SelectItem>
                <SelectItem value="section">Section</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TicketMarketplace listings={filteredListings} currency={location.currency} />
        </div>
      )}

      {/* Trust Badges */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-green-500" />
            </div>
            <span>100% Verified Tickets</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Lock className="h-4 w-4 text-blue-500" />
            </div>
            <span>Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Smartphone className="h-4 w-4 text-purple-500" />
            </div>
            <span>Mobile Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Star className="h-4 w-4 text-amber-500" />
            </div>
            <span>Money-Back Guarantee</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
