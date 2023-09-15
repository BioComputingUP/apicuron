import { Component, OnInit } from "@angular/core";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-foot",
  templateUrl: "./foot.component.html",
  styleUrls: ["./foot.component.scss"],
})
export class FootComponent implements OnInit {
  constructor() {}


  host = environment.host;
  ws = environment.ws + '/';

  link_list = [
    {
      link: "https://www.unipd.it/en/",
      image: "assets/logos/UniPD-800_logo_white.svg",
    },
    {
      link: "http://protein.bio.unipd.it/",
      image: "assets/logos/BioComputingUP_white.svg",
    },
    {
      link: "https://elixir-europe.org/",
      image: "assets/logos/ELIXIR_ITALY_colour_background.svg",
    },
    { link: "https://idpfun.eu/", image: "assets/logos/IDPfun.svg" },
    {
      link: "https://ngp-net.bio.unipd.it/",
      image: "assets/logos/NGP-net_curves_white_outline.svg",
    },
    { link: "https://europa.eu/", image: "assets/logos/EU_black.svg" },
  ];

  ngOnInit() {}
}
