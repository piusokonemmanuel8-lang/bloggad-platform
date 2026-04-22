import PremiumBrandBuilder from './builders/PremiumBrandBuilder';
import SupplementThemeBuilder from './builders/SupplementThemeBuilder';
import FurnitureThemeBuilder from './builders/FurnitureThemeBuilder';
import GroceryThemeBuilder from './builders/GroceryThemeBuilder';
import MultiProductBuilder from './builders/MultiProductBuilder';
import MextroBuilder from './builders/MextroBuilder';
import XxamBuilder from './builders/XxamBuilder';

export default function TemplateBuilderRouter(props) {
  const templateCodeKey = String(props?.templateCodeKey || '').trim().toLowerCase();

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

  if (
    templateCodeKey === 'mextro' ||
    templateCodeKey === 'mextro_theme' ||
    templateCodeKey === 'mextro_store' ||
    templateCodeKey === 'mextro_template'
  ) {
    return <MextroBuilder {...props} />;
  }

  if (
    templateCodeKey === 'xxam' ||
    templateCodeKey === 'xxam_theme' ||
    templateCodeKey === 'xxam_store' ||
    templateCodeKey === 'xxam_template'
  ) {
    return <XxamBuilder {...props} />;
  }

  if (templateCodeKey === 'premium_brand' || templateCodeKey === 'mega_electronics') {
    return <PremiumBrandBuilder {...props} />;
  }

  return null;
}