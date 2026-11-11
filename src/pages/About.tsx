import { useState, useMemo } from "react";
import { SlGraduation } from "react-icons/sl";
import { GoTrophy } from "react-icons/go";
import { FiTarget, FiSearch, FiMapPin, FiX } from "react-icons/fi";
import Hero from "../components/hero/Hero";
import MatricCard from "../components/matrics/MatricCard";
import { SOD_CENTERS } from "../data/centersData";

const MISSION_TASKS = [
  "Producing disciples who will do the work of our master, Jesus.",
  "Training dynamic soldiers of the cross for the end-time warfare.",
  "Equipping faithful men and women to teach others.",
  "Imparting basic teaching on every area of Christian living and service to ensure believers are relevant in this present world and prepared for heaven.",
];

const About = () => {
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract unique state names for the dropdown
  const allStates = useMemo(() => {
    return SOD_CENTERS.map((sc) => sc.state).sort();
  }, []);

  // Filter centers based on selected state and search query
  const filteredCenters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return SOD_CENTERS.map((item) => {
      // Check state filter
      if (selectedState !== "ALL" && item.state !== selectedState) {
        return null;
      }

      // If query is empty, return all centers in this state
      if (!query) {
        return item;
      }

      const stateMatches = item.state.toLowerCase().includes(query);
      const matchingCenters = item.centers.filter((c) =>
        c.toLowerCase().includes(query),
      );

      // If state matches query, keep all its centers; otherwise keep matching centers
      if (stateMatches) {
        return item;
      }

      if (matchingCenters.length > 0) {
        return {
          ...item,
          centers: matchingCenters,
        };
      }

      return null;
    }).filter((item): item is NonNullable<typeof item> => item !== null);
  }, [selectedState, searchQuery]);

  const totalMatchingCenters = useMemo(() => {
    return filteredCenters.reduce((sum, item) => sum + item.centers.length, 0);
  }, [filteredCenters]);

  const resetFilters = () => {
    setSelectedState("ALL");
    setSearchQuery("");
  };

  return (
    <div className="bg-surface-container-lowest text-charcoal">
      <Hero
        color="#1B2A5C"
        title="About Us"
        subtitle="The School of Disciples (SOD) — Equipping Christians across all denominations to be true and dynamic disciples of Jesus Christ."
        variant="sub"
        link="https://plus.unsplash.com/premium_photo-1677567996070-68fa4181775a?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />

      {/* Who We Are */}
      <section className="py-20 lg:py-24 bg-surface-container-lowest">
        <div className="max-w-custom mx-auto px-space-lg lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5">
              <div className="relative w-full h-80 sm:h-96 lg:h-[440px] rounded-card overflow-hidden border border-bordergray shadow-ambient bg-coolgray">
                <img
                  src="/images/Pastor5.jpg"
                  alt="Pastor E.A. Adeboye"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 p-6 z-10">
                  <p className="text-on-primary font-serif font-bold text-lg sm:text-xl">
                    Pastor E.A. Adeboye
                  </p>
                  <p className="text-inverse-on-surface/85 text-sm">
                    Founder &amp; General Overseer, RCCG Worldwide
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="w-8 h-[2px] bg-gold mb-5" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-navy mb-6 leading-tight">
                Who We Are
              </h2>
              <div className="space-y-5 text-charcoal text-base sm:text-[17px] leading-relaxed max-w-xl">
                <p>
                  The School of Disciples (SOD) was founded in 1985 by Pastor
                  E.A. Adeboye, the General Overseer of RCCG Worldwide. The
                  program is coordinated by Christ the Redeemer’s Ministries,
                  the evangelical arm of the Redeemed Christian Church of God.
                </p>
                <p>
                  SOD is open to Christians of all denominations who want to
                  learn to be true and genuine disciples of Jesus Christ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Motto & Mission */}
      <section className="py-20 lg:py-24 bg-[#fcfcfc] border-y border-bordergray">
        <div className="max-w-custom mx-auto px-space-lg lg:px-8">
          <div className="max-w-3xl text-left">
            <div className="w-8 h-[2px] bg-gold mb-5" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-navy mb-6 leading-tight">
              Our Motto &amp; Mission
            </h2>

            <div className="space-y-6 text-charcoal text-base sm:text-[17px] leading-relaxed max-w-2xl">
              <p>
                The school&apos;s motto is based on{" "}
                <strong className="font-semibold text-navy">John 14:12</strong>:{" "}
                <em className="font-serif italic text-charcoal">
                  “Verily verily I say unto you, he that believeth on me, the
                  works that I do shall he do also and greater works than these
                  shall he do, because I go unto my father”.
                </em>
              </p>

              <div>
                <p className="font-semibold text-navy mb-4">
                  We are tasked with:
                </p>
                <ul className="list-disc list-outside ml-6 space-y-3 marker:text-gold text-charcoal">
                  {MISSION_TASKS.map((task, idx) => (
                    <li key={idx}>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Training & Stats */}
      <section className="py-20 lg:py-24 bg-surface-container-lowest">
        <div className="max-w-custom mx-auto px-space-lg lg:px-8">
          <div className="max-w-3xl mb-12 text-left">
            <div className="w-8 h-[2px] bg-gold mb-4" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-navy mb-6 leading-tight">
              The Training
            </h2>
            <div className="space-y-4 text-charcoal text-base sm:text-[17px] leading-relaxed max-w-xl">
              <p>
                The whole training is practical and includes direct lectures
                from the Principal, Pastor E.A. Adeboye.
              </p>
              <p>
                Our focus is to make you an end-time army of Jesus Christ. We
                recommend this school to all denominations worldwide.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pt-4 border-t border-bordergray">
            <MatricCard
              title="Session"
              text="1 year of extensive training"
              icon={<SlGraduation />}
            />
            <MatricCard
              title="Modules"
              text="169 modules to be explored"
              icon={<GoTrophy />}
            />
            <MatricCard
              title="Enrollment"
              text="Over 100,000 enrollments"
              icon={<FiTarget />}
            />
          </div>
        </div>
      </section>

      {/* RCCG Americas 1 Centers Directory with Dropdown & Search Filter */}
      <section
        className="py-20 lg:py-24 bg-[#fcfcfc] border-t border-bordergray scroll-mt-16"
        id="centers"
      >
        <div className="max-w-custom mx-auto px-space-lg lg:px-8">
          <div className="max-w-3xl mb-10 text-left">
            <div className="w-8 h-[2px] bg-gold mb-4" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-navy mb-4 leading-tight">
              RCCG Americas 1 Centers
            </h2>
            <p className="text-charcoal text-base sm:text-[17px] leading-relaxed max-w-2xl mb-2">
              The School of Disciples RCCG Americas 1 has centers across the
              United States of America and North America. These centers meet
              in-person and/or virtually.
            </p>
            <p className="text-slate text-sm sm:text-base leading-relaxed">
              Use the state dropdown or search field below to find an active
              center near you.
            </p>
          </div>

          {/* Search & Dropdown Filter Bar */}
          <div className="bg-surface-container-lowest border border-bordergray rounded-card p-5 sm:p-6 mb-10 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Dropdown for State */}
              <div className="md:col-span-5">
                <label
                  htmlFor="state-select"
                  className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5"
                >
                  Select State or Region
                </label>
                <div className="relative">
                  <select
                    id="state-select"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full h-11 px-3.5 pr-8 bg-surface-container-lowest border border-bordergray rounded-md text-charcoal text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all cursor-pointer"
                  >
                    <option value="ALL">
                      All States &amp; Regions ({allStates.length})
                    </option>
                    {allStates.map((state) => {
                      const count =
                        SOD_CENTERS.find((s) => s.state === state)?.centers
                          .length || 0;
                      return (
                        <option key={state} value={state}>
                          {state} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Text Search Input */}
              <div className="md:col-span-5">
                <label
                  htmlFor="center-search"
                  className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5"
                >
                  Search by Center or City
                </label>
                <div className="relative">
                  <FiSearch
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52525B] w-4 h-4"
                    aria-hidden="true"
                  />
                  <input
                    id="center-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Jesus House, Baltimore, Houston..."
                    className="w-full h-11 pl-10 pr-10 bg-surface-container-lowest border border-bordergray rounded-md text-charcoal text-sm placeholder:text-[#52525B] focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/70 hover:text-navy cursor-pointer"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Reset Button & Count Indicator */}
              <div className="md:col-span-2 flex flex-col justify-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={selectedState === "ALL" && !searchQuery}
                  className="w-full h-11 inline-flex items-center justify-center px-4 rounded-md border border-bordergray bg-coolgray hover:bg-bordergray/50 text-navy text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Results count indicator */}
            <div className="mt-4 pt-4 border-t border-bordergray/60 flex flex-wrap items-center justify-between gap-2 text-xs text-charcoal/70">
              <span>
                Showing{" "}
                <strong className="text-navy">{totalMatchingCenters}</strong>{" "}
                {totalMatchingCenters === 1 ? "center" : "centers"} across{" "}
                <strong className="text-navy">{filteredCenters.length}</strong>{" "}
                {filteredCenters.length === 1 ? "region" : "regions"}
              </span>
              {(selectedState !== "ALL" || searchQuery) && (
                <span className="text-gold font-medium">
                  Filtered active view
                </span>
              )}
            </div>
          </div>

          {/* Centers List Display */}
          {filteredCenters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCenters.map((item) => (
                <div
                  key={item.state}
                  className="bg-surface-container-lowest border border-bordergray rounded-card p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-bordergray">
                      <div className="flex items-center gap-2">
                        <FiMapPin
                          className="w-4 h-4 text-gold shrink-0"
                          aria-hidden="true"
                        />
                        <h3 className="font-serif font-bold text-navy text-lg sm:text-xl">
                          {item.state}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-navy/5 text-navy">
                        {item.centers.length}{" "}
                        {item.centers.length === 1 ? "center" : "centers"}
                      </span>
                    </div>

                    <ul className="space-y-2.5">
                      {item.centers.map((center, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-charcoal flex items-start gap-2.5 leading-snug"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                          <span>{center}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {item.category === "Caribbean" && (
                    <div className="mt-5 pt-3 border-t border-bordergray/60">
                      <span className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider">
                        Caribbean Region
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-bordergray rounded-card p-12 text-center max-w-lg mx-auto">
              <FiMapPin className="w-8 h-8 text-[#52525B] mx-auto mb-3" />
              <h3 className="font-serif font-bold text-navy text-lg mb-2">
                No centers found
              </h3>
              <p className="text-slate text-sm mb-6 leading-relaxed">
                We couldn&apos;t find any centers matching your search criteria.
                Try selecting a different state or clearing your search.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center justify-center h-10 px-5 rounded-md bg-navy text-on-primary text-xs font-semibold uppercase tracking-wider hover:bg-navy-light transition-colors cursor-pointer"
              >
                Show All Centers
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default About;
