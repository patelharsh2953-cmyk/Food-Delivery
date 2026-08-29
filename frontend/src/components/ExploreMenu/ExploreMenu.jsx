import React, { useContext } from 'react';
import './ExploreMenu.css';
import { StoreContext } from '../../context/StoreContext';
import { menu_list, assets } from '../../assets/assets';

const ExploreMenu = ({ category, setCategory }) => {
    const { category_list, url } = useContext(StoreContext);

    const handleCategoryClick = (menuName) => {
        setCategory(prev => prev === menuName ? 'All' : menuName);
    };

    // Use dynamic categories from database if available, else fallback to menu_list assets
    const displayCategories = (category_list && category_list.length > 0)
        ? category_list.map((cat, idx) => ({
            menu_name: cat.name,
            menu_image: cat.image 
                ? (cat.image.startsWith('http') ? cat.image : (assets[cat.image] || `${url}/images/${cat.image}`)) 
                : (menu_list[idx % menu_list.length]?.menu_image || assets.menu_1)
        }))
        : menu_list;

    return (
        <section className="explore-menu" id="explore-menu">

            {/* ── Section header ── */}
            <div className="em-header">
                <h2 className="em-title">Explore our menu</h2>
                <p className="em-subtitle">
                    Choose from a diverse menu featuring a delectable array of dishes crafted
                    to satisfy your cravings and elevate your dining experience.
                </p>
            </div>

            {/* ── Category grid ── */}
            <div className="em-list">
                {displayCategories.map((item, index) => {
                    const isActive = category === item.menu_name;
                    return (
                        <div
                            key={index}
                            className={`em-item ${isActive ? 'em-item-active' : ''}`}
                            onClick={() => handleCategoryClick(item.menu_name)}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isActive}
                            onKeyDown={e => e.key === 'Enter' && handleCategoryClick(item.menu_name)}
                        >
                            {/* Circle image */}
                            <div className={`em-img-ring ${isActive ? 'em-img-ring-active' : ''}`}>
                                <div className="em-img-wrap">
                                    <img
                                        src={item.menu_image}
                                        alt={item.menu_name}
                                        className="em-img"
                                        onError={(e) => { e.target.src = assets.menu_1; }}
                                    />
                                </div>
                            </div>

                            {/* Label */}
                            <p className={`em-label ${isActive ? 'em-label-active' : ''}`}>
                                {item.menu_name}
                            </p>

                            {/* Active dot */}
                            {isActive && <span className="em-active-dot" />}
                        </div>
                    );
                })}
            </div>

            {/* ── Divider ── */}
            <div className="em-divider" />
        </section>
    );
};

export default ExploreMenu;