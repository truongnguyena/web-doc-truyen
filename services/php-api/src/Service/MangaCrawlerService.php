<?php

namespace App\Service;

use Goutte\Client;
use Symfony\Component\DomCrawler\Crawler;
use App\Entity\Manga;
use App\Entity\Chapter;
use App\Entity\Page;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\MessageBusInterface;
use App\Message\NewChapterNotification;

class MangaCrawlerService
{
    private $client;
    private $em;
    private $messageBus;

    public function __construct(
        EntityManagerInterface $em,
        MessageBusInterface $messageBus
    ) {
        $this->client = new Client();
        $this->em = $em;
        $this->messageBus = $messageBus;
    }

    public function crawlManga(string $url): Manga
    {
        $crawler = $this->client->request('GET', $url);

        $manga = new Manga();
        $manga->setTitle($this->extractTitle($crawler));
        $manga->setDescription($this->extractDescription($crawler));
        $manga->setAuthor($this->extractAuthor($crawler));
        $manga->setCoverImage($this->extractCoverImage($crawler));
        $manga->setGenres($this->extractGenres($crawler));

        $this->em->persist($manga);
        $this->em->flush();

        // Crawl chapters
        $this->crawlChapters($manga, $crawler);

        return $manga;
    }

    private function crawlChapters(Manga $manga, Crawler $crawler)
    {
        $chapterLinks = $crawler->filter('.chapter-list a')->links();

        foreach ($chapterLinks as $link) {
            $chapterUrl = $link->getUri();
            $chapter = $this->crawlChapter($manga, $chapterUrl);
            
            if ($chapter) {
                $this->messageBus->dispatch(new NewChapterNotification($manga->getId(), $chapter->getId()));
            }
        }
    }

    private function crawlChapter(Manga $manga, string $url): ?Chapter
    {
        $crawler = $this->client->request('GET', $url);

        $chapter = new Chapter();
        $chapter->setManga($manga);
        $chapter->setNumber($this->extractChapterNumber($crawler));
        $chapter->setTitle($this->extractChapterTitle($crawler));

        $this->em->persist($chapter);

        // Crawl pages
        $pageUrls = $this->extractPageUrls($crawler);
        foreach ($pageUrls as $index => $pageUrl) {
            $page = new Page();
            $page->setChapter($chapter);
            $page->setNumber($index + 1);
            $page->setImageUrl($pageUrl);

            $this->em->persist($page);
        }

        $this->em->flush();

        return $chapter;
    }

    private function extractTitle(Crawler $crawler): string
    {
        return $crawler->filter('.manga-title')->text();
    }

    private function extractDescription(Crawler $crawler): string
    {
        return $crawler->filter('.manga-description')->text();
    }

    private function extractAuthor(Crawler $crawler): string
    {
        return $crawler->filter('.manga-author')->text();
    }

    private function extractCoverImage(Crawler $crawler): string
    {
        return $crawler->filter('.manga-cover img')->attr('src');
    }

    private function extractGenres(Crawler $crawler): array
    {
        return $crawler->filter('.manga-genres span')->each(function ($node) {
            return $node->text();
        });
    }

    private function extractChapterNumber(Crawler $crawler): float
    {
        $number = $crawler->filter('.chapter-number')->text();
        return (float) preg_replace('/[^0-9.]/', '', $number);
    }

    private function extractChapterTitle(Crawler $crawler): string
    {
        return $crawler->filter('.chapter-title')->text();
    }

    private function extractPageUrls(Crawler $crawler): array
    {
        return $crawler->filter('.chapter-images img')->each(function ($node) {
            return $node->attr('src');
        });
    }
}
