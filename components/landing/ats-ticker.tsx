import React from "react";

export function AtsTicker() {
  return (
    <section className="ticker-section">
      <div className="ticker-title">
        Compatible With All Major Enterprise ATS &amp; Career Portals
      </div>
      <div className="ticker-grid">
        <div className="ticker-item">
          <i className="fa-brands fa-microsoft" />
          <span>Workday ATS</span>
        </div>
        <div className="ticker-item">
          <i className="fa-solid fa-leaf" />
          <span>Greenhouse</span>
        </div>
        <div className="ticker-item">
          <i className="fa-solid fa-bolt" />
          <span>Lever</span>
        </div>
        <div className="ticker-item">
          <i className="fa-solid fa-rocket" />
          <span>Ashby HQ</span>
        </div>
        <div className="ticker-item">
          <i className="fa-solid fa-building-user" />
          <span>SmartRecruiters</span>
        </div>
        <div className="ticker-item">
          <i className="fa-solid fa-database" />
          <span>Oracle Taleo</span>
        </div>
        <div className="ticker-item">
          <i className="fa-solid fa-briefcase" />
          <span>Custom Career Portals</span>
        </div>
      </div>
    </section>
  );
}
