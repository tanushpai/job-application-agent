import React from "react";
import { User, Mail, Phone, MapPin, Globe, Share2 } from "lucide-react";

export interface GeneralInfoState {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  website: string;
  linkedin: string;
  github: string;
  twitter: string;
}

interface PersonalInfoTabProps {
  general: GeneralInfoState;
  onChange: (field: keyof GeneralInfoState, value: string) => void;
}

export function PersonalInfoTab({ general, onChange }: PersonalInfoTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
          <User className="size-4 text-primary" />
          Basic Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Full Name *
            </label>
            <input
              type="text"
              value={general.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              placeholder="e.g. Alex Chen"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Mail className="size-3" /> Email Address *
            </label>
            <input
              type="email"
              value={general.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="alex.chen@example.com"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Phone className="size-3" /> Phone Number
            </label>
            <input
              type="tel"
              value={general.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <MapPin className="size-3" /> Location (City, State / Country)
            </label>
            <input
              type="text"
              value={general.location}
              onChange={(e) => onChange("location", e.target.value)}
              placeholder="San Francisco, CA (or Remote)"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Professional Headline
          </label>
          <input
            type="text"
            value={general.headline}
            onChange={(e) => onChange("headline", e.target.value)}
            placeholder="Senior Full Stack Software Engineer | Distributed Systems & AI"
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Executive Summary / Bio
          </label>
          <textarea
            rows={3}
            value={general.summary}
            onChange={(e) => onChange("summary", e.target.value)}
            placeholder="Brief 2-3 sentence overview of your domain expertise, technical depth, and career track record."
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
          <Share2 className="size-4 text-primary" />
          Online Profiles &amp; Social Links
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Globe className="size-3" /> Personal Portfolio / Website
            </label>
            <input
              type="url"
              value={general.website}
              onChange={(e) => onChange("website", e.target.value)}
              placeholder="https://alexchen.dev"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              value={general.linkedin}
              onChange={(e) => onChange("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/alexchen"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              GitHub Profile URL
            </label>
            <input
              type="url"
              value={general.github}
              onChange={(e) => onChange("github", e.target.value)}
              placeholder="https://github.com/alexchen"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Twitter / X Profile URL
            </label>
            <input
              type="url"
              value={general.twitter}
              onChange={(e) => onChange("twitter", e.target.value)}
              placeholder="https://x.com/alexchen"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
