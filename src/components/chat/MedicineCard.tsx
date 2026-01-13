import { Medicine } from '@/types/medicine';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Pill, 
  Building2, 
  FlaskConical, 
  Stethoscope, 
  AlertTriangle, 
  ShieldAlert, 
  Ban, 
  ArrowRightLeft, 
  IndianRupee, 
  MapPin,
  Package
} from 'lucide-react';

interface MedicineCardProps {
  medicine: Medicine;
}

const getScheduleBadgeVariant = (schedule: Medicine['schedule']) => {
  switch (schedule) {
    case 'OTC':
      return 'bg-success/10 text-success border-success/20';
    case 'Prescription':
      return 'bg-info/10 text-info border-info/20';
    case 'Schedule H':
    case 'Schedule H1':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'Schedule X':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getAvailabilityColor = (availability: Medicine['availability']) => {
  switch (availability) {
    case 'Widely Available':
      return 'text-success';
    case 'Available':
      return 'text-info';
    case 'Limited':
      return 'text-warning';
    case 'Prescription Only':
      return 'text-muted-foreground';
    default:
      return 'text-foreground';
  }
};

const MedicineCard = ({ medicine }: MedicineCardProps) => {
  return (
    <Card className="w-full max-w-2xl border-medicine-border shadow-card overflow-hidden animate-slide-up">
      {/* Header */}
      <CardHeader className="bg-medicine-header pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Pill className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">
                {medicine.name}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5" />
                {medicine.manufacturer}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`${getScheduleBadgeVariant(medicine.schedule)} font-medium`}
          >
            {medicine.schedule}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Composition */}
        <Section 
          icon={<FlaskConical className="w-4 h-4" />} 
          title="Composition"
        >
          <p className="text-sm text-foreground font-medium">{medicine.composition}</p>
        </Section>

        <Separator className="bg-border/60" />

        {/* Uses */}
        <Section 
          icon={<Stethoscope className="w-4 h-4" />} 
          title="Uses"
        >
          <ul className="text-sm text-muted-foreground space-y-1">
            {medicine.uses.map((use, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                {use}
              </li>
            ))}
          </ul>
        </Section>

        {medicine.mechanismOfAction && (
          <>
            <Separator className="bg-border/60" />
            <Section 
              icon={<FlaskConical className="w-4 h-4" />} 
              title="Mechanism of Action"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {medicine.mechanismOfAction}
              </p>
            </Section>
          </>
        )}

        <Separator className="bg-border/60" />

        {/* Dosage Forms */}
        <Section 
          icon={<Package className="w-4 h-4" />} 
          title="Available Forms"
        >
          <div className="flex flex-wrap gap-2">
            {medicine.dosageForms.map((form, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {form}
              </Badge>
            ))}
          </div>
        </Section>

        <Separator className="bg-border/60" />

        {/* Side Effects */}
        <Section 
          icon={<AlertTriangle className="w-4 h-4 text-warning" />} 
          title="Side Effects"
          titleClassName="text-warning"
        >
          <div className="flex flex-wrap gap-1.5">
            {medicine.sideEffects.map((effect, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-xs bg-warning/5 text-warning/90 border-warning/20"
              >
                {effect}
              </Badge>
            ))}
          </div>
        </Section>

        <Separator className="bg-border/60" />

        {/* Precautions */}
        <Section 
          icon={<ShieldAlert className="w-4 h-4 text-info" />} 
          title="Precautions"
          titleClassName="text-info"
        >
          <ul className="text-sm text-muted-foreground space-y-1">
            {medicine.precautions.map((precaution, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-info mt-1.5 flex-shrink-0" />
                {precaution}
              </li>
            ))}
          </ul>
        </Section>

        <Separator className="bg-border/60" />

        {/* Contraindications */}
        <Section 
          icon={<Ban className="w-4 h-4 text-destructive" />} 
          title="Contraindications"
          titleClassName="text-destructive"
        >
          <ul className="text-sm text-muted-foreground space-y-1">
            {medicine.contraindications.map((contra, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                {contra}
              </li>
            ))}
          </ul>
        </Section>

        <Separator className="bg-border/60" />

        {/* Alternatives */}
        <Section 
          icon={<ArrowRightLeft className="w-4 h-4" />} 
          title="Indian Alternatives"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {medicine.alternatives.map((alt, idx) => (
              <div 
                key={idx} 
                className="p-2.5 rounded-lg bg-accent/50 border border-accent"
              >
                <p className="text-sm font-medium text-foreground">{alt.name}</p>
                <p className="text-xs text-muted-foreground">{alt.manufacturer}</p>
                {alt.priceRange && (
                  <p className="text-xs text-primary font-medium mt-1">{alt.priceRange}</p>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Separator className="bg-border/60" />

        {/* Price & Availability */}
        <div className="grid grid-cols-2 gap-4">
          <Section 
            icon={<IndianRupee className="w-4 h-4" />} 
            title="Price Range"
          >
            <p className="text-lg font-bold text-primary">
              ₹{medicine.priceRange.min} - ₹{medicine.priceRange.max}
            </p>
            <p className="text-xs text-muted-foreground">{medicine.priceRange.unit}</p>
          </Section>

          <Section 
            icon={<MapPin className="w-4 h-4" />} 
            title="Availability"
          >
            <p className={`text-sm font-semibold ${getAvailabilityColor(medicine.availability)}`}>
              {medicine.availability}
            </p>
          </Section>
        </div>
      </CardContent>
    </Card>
  );
};

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  titleClassName?: string;
  children: React.ReactNode;
}

const Section = ({ icon, title, titleClassName, children }: SectionProps) => (
  <div className="space-y-2">
    <div className={`flex items-center gap-2 ${titleClassName || 'text-foreground'}`}>
      {icon}
      <h4 className="text-sm font-semibold">{title}</h4>
    </div>
    {children}
  </div>
);

export default MedicineCard;
