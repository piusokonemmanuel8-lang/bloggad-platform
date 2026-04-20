import PremiumBrandBuilder from './builders/PremiumBrandBuilder';
import SupplementThemeBuilder from './builders/SupplementThemeBuilder';
import FurnitureThemeBuilder from './builders/FurnitureThemeBuilder';
import GroceryThemeBuilder from './builders/GroceryThemeBuilder';
import MultiProductBuilder from './builders/MultiProductBuilder';

export default function TemplateBuilderRouter(props) {
  const { templateCodeKey } = props;

  if (templateCodeKey === 'supplement_theme') {
    return <SupplementThemeBuilder {...props} />;
  }

  if (templateCodeKey === 'furniture_theme') {
    return <FurnitureThemeBuilder {...props} />;
  }

  if (templateCodeKey === 'grocery_theme') {
    return <GroceryThemeBuilder {...props} />;
  }

  if (templateCodeKey === 'multi_product') {
    return <MultiProductBuilder {...props} />;
  }

  if (templateCodeKey === 'premium_brand' || templateCodeKey === 'mega_electronics') {
    return <PremiumBrandBuilder {...props} />;
  }

  return null;
}