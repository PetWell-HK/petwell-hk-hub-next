import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Phone, Mail, Globe, ArrowLeft, Heart, 
  Users, Calendar, Clock, MapPinned, CheckCircle2 
} from "lucide-react";
import { useNGO } from "@/hooks/useNGOs";

const NGODetail = () => {
  const { ngoId } = useParams();
  const { t, i18n } = useTranslation();
  const { ngo, isLoading, error } = useNGO(ngoId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <p className="text-center">{t('common.loading')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !ngo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <p className="text-center text-destructive">{t('ngos.notFound')}</p>
            <div className="text-center mt-4">
              <Link to="/ngos">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('ngos.backToList')}
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const donationProgress = (campaign: typeof ngo.donationCampaigns[0]) => 
    Math.round((campaign.currentAmount / campaign.goalAmount) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-6 pb-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="mb-6">
            <Link to="/ngos">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t('ngos.backToList')}
              </Button>
            </Link>
          </div>

          {/* NGO Header */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">
                    {i18n.language === 'en' ? ngo.nameEn : ngo.name}
                  </CardTitle>
                  {ngo.established && (
                    <Badge variant="secondary" className="mb-3">
                      {t('ngos.established')}: {ngo.established}
                    </Badge>
                  )}
                  <CardDescription className="text-base">
                    {i18n.language === 'en' ? ngo.descriptionEn : ngo.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{t('ngos.address')}</p>
                    <p className="text-muted-foreground text-sm">{ngo.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{t('ngos.phone')}</p>
                    <a href={`tel:${ngo.phone}`} className="text-muted-foreground text-sm hover:text-primary">
                      {ngo.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{t('ngos.email')}</p>
                    <a href={`mailto:${ngo.email}`} className="text-muted-foreground text-sm hover:text-primary break-all">
                      {ngo.email}
                    </a>
                  </div>
                </div>
                {ngo.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{t('ngos.website')}</p>
                      <a 
                        href={ngo.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground text-sm hover:text-primary break-all"
                      >
                        {ngo.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Mission */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('ngos.mission')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {i18n.language === 'en' ? ngo.missionEn : ngo.mission}
                  </p>
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('ngos.services')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {(i18n.language === 'en' ? ngo.servicesEn : ngo.services).map((service, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{service}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Donation Campaigns */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    <CardTitle>{t('ngos.donationCampaigns')}</CardTitle>
                  </div>
                  <CardDescription>{t('ngos.donationDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {ngo.donationCampaigns.map((campaign) => (
                    <div key={campaign.id} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{campaign.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('ngos.progress')}</span>
                          <span className="font-semibold">{donationProgress(campaign)}%</span>
                        </div>
                        <Progress value={donationProgress(campaign)} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>HK${campaign.currentAmount.toLocaleString()} / HK${campaign.goalAmount.toLocaleString()}</span>
                          <span>{campaign.donorsCount} {t('ngos.donors')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                          {t('ngos.endDate')}: {new Date(campaign.endDate).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'zh-HK')}
                        </span>
                        <Button size="sm" className="gap-2">
                          <Heart className="w-4 h-4" />
                          {t('ngos.donate')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Volunteer Events */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle>{t('ngos.volunteerEvents')}</CardTitle>
                  </div>
                  <CardDescription>{t('ngos.volunteerDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ngo.volunteerEvents.map((event) => (
                    <div key={event.id} className="space-y-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-sm">{event.title}</h3>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{new Date(event.date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'zh-HK')}</span>
                        </div>
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{event.duration}</span>
                        </div>
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPinned className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">{event.description}</p>

                      <div className="space-y-2">
                        <div className="text-xs">
                          <span className="font-medium">{t('ngos.requirements')}:</span>
                          <ul className="mt-1 ml-4 list-disc text-muted-foreground space-y-1">
                            {event.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <Badge variant={event.spotsAvailable > 0 ? "default" : "secondary"}>
                            {event.spotsAvailable > 0 
                              ? `${event.spotsAvailable} ${t('ngos.spotsLeft')}`
                              : t('ngos.fullBooked')
                            }
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            disabled={event.spotsAvailable === 0}
                            className="text-xs"
                          >
                            {t('ngos.enroll')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NGODetail;
