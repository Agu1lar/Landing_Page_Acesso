/** Depoimentos publicados no Google Meu Negócio — pt-BR (validar periodicamente com o cliente) */
export type Testimonial = {
  id: string;
  author: string;
  rating: number;
  text: string;
  source: 'google';
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'mariana-araujo',
    author: 'Mariana Araújo',
    rating: 5,
    text: 'Empresa muito organizada e correta. Produtos de extrema qualidade e preço acessível.',
    source: 'google',
  },
  {
    id: 'daniel-ramon',
    author: 'Daniel Ramon Dharma',
    rating: 5,
    text: 'Serviços de qualidade e responsabilidade e confiança. Equipe nota 1000! Acesso Equipamentos você pode confiar!',
    source: 'google',
  },
  {
    id: 'gregory-nicoli',
    author: 'Gregory Nicoli',
    rating: 5,
    text: 'Excelente empresa! Muito pontual, correta e cumpre aquilo que o cliente precisa!',
    source: 'google',
  },
];

/** Link para avaliações no Google Maps (ajustar Place ID quando disponível) */
export const GOOGLE_REVIEWS_URL =
  'https://www.google.com/maps/search/?api=1&query=Acesso+Equipamentos+Praça+Chuí+100+Belo+Horizonte';
